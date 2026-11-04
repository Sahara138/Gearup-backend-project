export interface ICreateGearItemPayload {
    title: string;
    description: string;

    brand?: string;
    images: string[]
    specifications?: string

  price : number;
  discountPrice ?: number;

  rating ?: 
  reviewCount Int   @default(0)

  stock  Int        @default(0)
  status GearStatus @default(ACTIVE)
}