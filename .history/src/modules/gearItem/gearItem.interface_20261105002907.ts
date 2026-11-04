export interface ICreateGearItemPayload {
    title: string;
    description: string;

    brand?: string;
    images: string[]
    specifications?: string

  price?: 
  discountPrice Decimal? @db.Decimal(10, 2)

  rating      Float @default(0)
  reviewCount Int   @default(0)

  stock  Int        @default(0)
  status GearStatus @default(ACTIVE)
}