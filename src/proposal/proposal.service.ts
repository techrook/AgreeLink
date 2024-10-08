import {
  Injectable,
  NotFoundException,
   Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalService {
   private readonly logger = new Logger(ProposalService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Create proposal with both client and service provider email
  async createProposal(dto: CreateProposalDto, userId: string) {
     this.logger.log(`Creating a proposal by user: ${userId}`);
    try {
      if (!userId) {
        this.logger.warn(`User not found for email: ${userId}`);
        throw new NotFoundException('User not found');
      }

      const client = await this.prisma.user.findUnique({
        where: { email: dto.client },
      });

      const serviceProvider = await this.prisma.user.findUnique({
        where: { email: dto.serviceProvider },
      });

      if (!client || !serviceProvider) {
        throw new NotFoundException('Client or Service Provider not found');
      }

      const proposal = await this.prisma.proposal.create({
        data: {
          title: dto.title,
          description: dto.description,
          duration: dto.duration,
          paymentTerms: dto.paymentTerms,
          status: dto.status,
          clientId: client.id,
          serviceProviderId: serviceProvider.id,
          createdById: userId,
        },
      });

        this.logger.log(`Proposal created successfully: ${proposal.id}`);
      return proposal;
    } catch (error) {
       this.logger.error('Error creating proposal', error.stack);
      throw new InternalServerErrorException('Unable to create proposal');
    }
  }

  async getAllProposals(userId: string) {
      this.logger.log(`Fetching all proposals for user: ${userId}`);
    try {
      const proposals = await this.prisma.proposal.findMany({
        where: { createdById: userId },
      });

      const count = proposals.length;

       this.logger.log(`Fetched ${count} proposals for user: ${userId}`);
      return { proposals, count };
    } catch (error) {
      this.logger.error('Error fetching proposals', error.stack);
      throw new InternalServerErrorException('Unable to fetch proposals');
    }
  }

  async getProposalById(id: string) {
    this.logger.log(`Fetching proposal with ID: ${id}`);
    try {
      const proposal = await this.prisma.proposal.findUnique({
        where: { id },
      });

      if (!proposal) {
             this.logger.warn(`Proposal with ID ${id} not found`);
        throw new NotFoundException(`Proposal with ID ${id} not found`);
      }

       this.logger.log(`Fetched proposal with ID: ${id}`);
      return proposal;
    } catch (error) {
        this.logger.error(`Error fetching proposal with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Unable to fetch proposal');
    }
  }

  async updateProposal(id: string, dto: UpdateProposalDto) {
      this.logger.log(`Updating proposal with ID: ${id}`);
    try {
      const proposal = await this.prisma.proposal.update({
        where: { id },
        data: dto,
      });

         this.logger.log(`Updated proposal with ID: ${id}`);
      return { message: `Proposal with ID ${id} has been updated`, proposal };
    } catch (error) {
         this.logger.error(`Error updating proposal with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Unable to update proposal');
    }
  }

  async deleteProposal(id: string): Promise<{ message: string }> {
      this.logger.log(`Deleting proposal with ID: ${id}`);
    try {
      await this.prisma.proposal.delete({
        where: { id },
      });

          this.logger.log(`Deleted proposal with ID: ${id}`);
      return { message: `Proposal with ID ${id} has been deleted` };
    } catch (error) {
          this.logger.error(`Error deleting proposal with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Unable to delete proposal');
    }
  }
}
