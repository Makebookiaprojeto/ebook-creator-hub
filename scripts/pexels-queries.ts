// Contextual Pexels search queries per template.
// Cover = portrait orientation. Chapters = landscape.
// Focus: real people / situations, not isolated objects.

export type PexelsQuerySet = {
  cover: string;
  chapters: [string, string, string, string, string];
};

export const PEXELS_QUERIES: Record<string, PexelsQuerySet> = {
  emagrecimento: {
    cover: "woman healthy lifestyle morning",
    chapters: [
      "woman eating healthy salad bowl",
      "person walking exercise park morning",
      "woman sleeping peacefully bed",
      "woman drinking water bottle fitness",
      "woman jogging consistency outdoor",
    ],
  },
  fitness: {
    cover: "man weightlifting gym strong",
    chapters: [
      "man lifting barbell squat gym",
      "athlete eating high protein meal",
      "man resting recovery gym bench",
      "personal trainer coaching technique",
      "athlete training discipline long term",
    ],
  },
  financas: {
    cover: "person managing personal finances laptop",
    chapters: [
      "person reviewing bank statement notebook",
      "couple budgeting kitchen table calculator",
      "person paying bills credit card laptop",
      "person saving money piggy bank emergency",
      "young investor checking stocks phone",
    ],
  },
  beleza: {
    cover: "woman skincare routine bathroom",
    chapters: [
      "woman washing face gentle skincare",
      "woman applying moisturizer mirror",
      "woman applying sunscreen face outdoor",
      "woman sleeping skin healthy",
      "woman skincare bathroom mirror routine",
    ],
  },
  "desenvolvimento-pessoal": {
    cover: "person journaling personal growth desk",
    chapters: [
      "person writing journal reflection morning",
      "person planning goals notebook desk",
      "person reading book habit morning",
      "tidy organized workspace minimalist",
      "person meditating sunday reflection",
    ],
  },
  espiritualidade: {
    cover: "person meditating sunrise peaceful",
    chapters: [
      "person meditating silence morning candle",
      "person grateful praying hands light",
      "person hiking forest nature peace",
      "person yoga meditation home",
      "volunteers helping community kindness",
    ],
  },
  maternidade: {
    cover: "mother holding newborn baby tender",
    chapters: [
      "mother baby sleeping crib night",
      "mother breastfeeding baby home",
      "family support grandmother baby",
      "tired happy mother coffee baby",
      "mother bonding eye contact baby",
    ],
  },
  "marketing-digital": {
    cover: "entrepreneur laptop online business",
    chapters: [
      "entrepreneur choosing niche notebook laptop",
      "creator filming content phone audience",
      "person designing offer presentation laptop",
      "marketer analyzing ad metrics laptop",
      "customer service chat smiling laptop",
    ],
  },
  relacionamentos: {
    cover: "happy couple holding hands sunset",
    chapters: [
      "couple talking honestly coffee",
      "couple respecting boundaries calm",
      "couple cooking together kitchen",
      "couple resolving conflict calmly home",
      "couple grateful smiling hug",
    ],
  },
  receitas: {
    cover: "healthy fit food meal prep",
    chapters: [
      "grilled chicken bowl vegetables healthy",
      "woman cooking omelette vegetables pan",
      "salmon dinner vegetables plate",
      "smoothie protein post workout glass",
      "fresh complete salad bowl wooden",
    ],
  },
  pets: {
    cover: "person hugging dog love pet",
    chapters: [
      "owner feeding dog healthy bowl",
      "trainer rewarding dog positive",
      "person running dog park exercise",
      "veterinarian checking dog clinic",
      "person playing cuddle cat dog",
    ],
  },
  "saude-mental": {
    cover: "woman breathing calm peaceful window",
    chapters: [
      "woman deep breathing meditation calm",
      "person walking outdoor mental health",
      "person putting away phone digital detox",
      "friends talking supportive coffee",
      "therapist talking patient counseling",
    ],
  },
  empreendedorismo: {
    cover: "young entrepreneur small business owner",
    chapters: [
      "entrepreneur interviewing customer feedback",
      "founder building product prototype laptop",
      "focused entrepreneur deep work laptop",
      "small business owner cash register shop",
      "entrepreneur persisting late night work",
    ],
  },
  estudos: {
    cover: "student studying focused library",
    chapters: [
      "student reading exam edital highlight",
      "student studying routine morning desk",
      "student solving practice questions paper",
      "student review flashcards notes",
      "student healthy snack break study",
    ],
  },
  idiomas: {
    cover: "person learning english headphones laptop",
    chapters: [
      "person listening english podcast headphones",
      "people conversation language exchange cafe",
      "person learning vocabulary notebook",
      "english grammar book student desk",
      "person studying language daily habit",
    ],
  },
  "renda-extra": {
    cover: "freelancer working laptop coffee home",
    chapters: [
      "freelance designer working laptop home",
      "online course creator filming tutorial",
      "affiliate marketer laptop honest review",
      "handyman local service smiling client",
      "person investing extra income laptop",
    ],
  },
  viagens: {
    cover: "traveler airport window plane sunrise",
    chapters: [
      "traveler booking flight laptop home",
      "traveler entering hotel room suitcase",
      "tourist relaxing scenic viewpoint travel",
      "tourist eating local street food market",
      "traveler passport documents suitcase",
    ],
  },
  tecnologia: {
    cover: "developer coding laptop programmer desk",
    chapters: [
      "beginner programmer learning laptop tutorial",
      "developer coding daily practice laptop",
      "developer github portfolio screen",
      "developer reading english documentation",
      "developers collaborating community meetup",
    ],
  },
  decoracao: {
    cover: "modern minimalist living room interior",
    chapters: [
      "designer mood board interior swatches",
      "warm pendant light cozy living room",
      "interior color palette neutral textures sofa",
      "minimalist clean bright living room",
      "indoor plants modern living room shelf",
    ],
  },
  moda: {
    cover: "stylish person outfit minimalist street",
    chapters: [
      "woman mirror checking outfit fit",
      "capsule wardrobe neutral clothing rack",
      "linen cotton quality clothing closeup person",
      "stylish accessories watch leather man",
      "confident person walking street style",
    ],
  },
};
