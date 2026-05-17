import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferEntity } from '../offer/entities/offer.entity';
import { EOfferStatus } from '../offer/enums/offer-status.enum';
import { OrderEntity } from '../order/entities/order.entity';
import { EOrderStatus } from '../order/enums/order-status.enum';
import { CreateFeedbackDto } from './dtos/requests/create-feedback.dto';
import { FeedbackEntity } from './entities/feedback.entity';

const FEEDBACK_ELIGIBLE_STATUSES: EOrderStatus[] = [
  EOrderStatus.COMPLETED_BY_CLEANER,
  EOrderStatus.COMPLETED_BY_USER,
  EOrderStatus.DONE,
];

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  public async create(authorId: string, dto: CreateFeedbackDto) {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId },
      relations: [
        'user',
        'offers',
        'offers.application',
        'offers.application.cleaner',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!FEEDBACK_ELIGIBLE_STATUSES.includes(order.status)) {
      throw new UnprocessableEntityException(
        'Feedback can only be left after the order is completed',
      );
    }

    const offers: OfferEntity[] = order.offers ?? [];
    const acceptedOffer = offers.find(
      (o: OfferEntity) => o.status === EOfferStatus.ACCEPTED,
    );
    const customerId = order.user?.id;
    const cleanerId = acceptedOffer?.application?.cleaner?.id;
    let recipientId: string;

    if (customerId && authorId === customerId) {
      if (!cleanerId) {
        throw new UnprocessableEntityException(
          'Order has no assigned cleaner',
        );
      }
      recipientId = cleanerId;
    } else if (cleanerId && authorId === cleanerId) {
      recipientId = customerId;
    } else {
      throw new ForbiddenException('You are not a participant of this order');
    }

    const existing = await this.feedbackRepository.findOne({
      where: { orderId: dto.orderId, authorId },
    });
    if (existing) {
      throw new ConflictException('Feedback already exists for this order');
    }

    return await this.feedbackRepository.save({
      orderId: dto.orderId,
      authorId,
      recipientId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
  }

  public async getByOrderId(orderId: string) {
    return await this.feedbackRepository.find({
      where: { orderId },
      relations: ['author', 'recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  public async getByRecipientId(userId: string) {
    return await this.feedbackRepository.find({
      where: { recipientId: userId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  public async getByAuthorId(authorId: string) {
    return await this.feedbackRepository.find({
      where: { authorId },
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  public async getCleanerAverage(cleanerId: string) {
    const raw = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'avg')
      .addSelect('COUNT(feedback.id)', 'count')
      .where('feedback.recipientId = :cleanerId', { cleanerId })
      .getRawOne<{ avg: string | null; count: string }>();

    return {
      cleanerId,
      averageRating: raw?.avg ? Number(Number(raw.avg).toFixed(2)) : null,
      count: raw ? Number(raw.count) : 0,
    };
  }
}
