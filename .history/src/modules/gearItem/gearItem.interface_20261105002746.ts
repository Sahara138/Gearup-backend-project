export interface ICreateGearItemPayload {
    title: string;
    description ?: string;

    brand          String?
    images         String[]
    specifications Json?

  price         Decimal  @db.Decimal(10, 2)
  discountPrice Decimal? @db.Decimal(10, 2)

  rating      Float @default(0)
  reviewCount Int   @default(0)

  stock  Int        @default(0)
  status GearStatus @default(ACTIVE)
}