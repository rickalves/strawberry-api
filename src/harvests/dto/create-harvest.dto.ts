// src/harvests/dto/create-harvest.dto.ts
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateHarvestDto {
  @IsUUID()
  plotId: string;

  @IsDateString()
  data: string;

  @IsNumber()
  @Min(0.01)
  peso_kg: number;

  @IsOptional()
  @IsString()
  qualidade?: string;
}
