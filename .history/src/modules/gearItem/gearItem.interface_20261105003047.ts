import { GearStatus } from "../../../generated/prisma/enums.js";

export interface ICreateGearItemPayload {
    title: string;
    description: string;

    brand?: string;
    images: string[]
    specifications?: string

  price : number;
  discountPrice ?: number;

  rating ?: number;
  reviewCount Int   @default(0)

  stock : number
  status ?: GearStatus;
}