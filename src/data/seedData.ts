import { Book, Chapter, AuthorProfile, UserProfile, TokenPackage, GenreItem, PlatformSettings, AdSlotConfig } from '../types';

export const INITIAL_GENRES: GenreItem[] = [
  { id: 'african-literature', name: 'African Literature', slug: 'african-literature', description: 'Contemporary & classic voices across Africa and the diaspora', active: true },
  { id: 'romance', name: 'Romance', slug: 'romance', description: 'Passionate tales of love, longing, and serendipity', active: true },
  { id: 'drama', name: 'Drama', slug: 'drama', description: 'Intense human conflict, relationships, and emotional journeys', active: true },
  { id: 'thriller', name: 'Thriller', slug: 'thriller', description: 'High-stakes suspense, conspiracies, and pulse-pounding mystery', active: true },
  { id: 'mystery', name: 'Mystery', slug: 'mystery', description: 'Whodunits, investigations, and enigmatic secrets', active: true },
  { id: 'fantasy', name: 'Fantasy', slug: 'fantasy', description: 'Mythic realms, ancient sorcery, and extraordinary folklore', active: true },
  { id: 'horror', name: 'Horror', slug: 'horror', description: 'Chilling tales of the supernatural and psychological dread', active: true },
  { id: 'historical-fiction', name: 'Historical Fiction', slug: 'historical-fiction', description: 'Vivid chronicles set against real historical turning points', active: true },
  { id: 'poetry', name: 'Poetry', slug: 'poetry', description: 'Lyrical reflections, spoken word verses, and evocative stanzas', active: true },
  { id: 'science-fiction', name: 'Science Fiction', slug: 'science-fiction', description: 'Futuristic visions, cybernetic worlds, and speculative futures', active: true },
  { id: 'crime', name: 'Crime', slug: 'crime', description: 'Noir investigations, detectives, and underworld sagas', active: true },
  { id: 'comedy', name: 'Comedy', slug: 'comedy', description: 'Witty humor, satirical humor, and heartwarming laughter', active: true },
  { id: 'young-adult', name: 'Young Adult', slug: 'young-adult', description: 'Coming-of-age journeys and vibrant teenage struggles', active: true },
  { id: 'inspirational', name: 'Inspirational', slug: 'inspirational', description: 'Uplifting stories of triumph, perseverance, and spiritual growth', active: true },
  { id: 'short-stories', name: 'Short Stories', slug: 'short-stories', description: 'Bite-sized literary gems and compelling single-sitting reads', active: true },
  { id: 'christian', name: 'Christian', slug: 'christian', description: 'Faith-anchored journeys and inspirational moral tales', active: true },
  { id: 'family', name: 'Family', slug: 'family', description: 'Generational sagas and heartfelt family bonds', active: true },
  { id: 'children', name: 'Children', slug: 'children', description: 'Enchanting stories and adventures for young minds', active: true },
  { id: 'business', name: 'Business', slug: 'business', description: 'Enterprising narratives, leadership insights, and grit', active: true },
  { id: 'adventure', name: 'Adventure', slug: 'adventure', description: 'Expeditions across uncharted lands and daring quests', active: true },
];

export const INITIAL_TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'pack-starter',
    name: 'Starter Scroll',
    tokens: 40,
    bonusTokens: 0,
    priceCents: 199, // $1.99
    currency: 'USD',
    popular: false,
    active: true,
  },
  {
    id: 'pack-reader',
    name: "Reader's Cache",
    tokens: 120,
    bonusTokens: 15,
    priceCents: 499, // $4.99
    currency: 'USD',
    popular: true,
    active: true,
  },
  {
    id: 'pack-bibliophile',
    name: 'Bibliophile Vault',
    tokens: 300,
    bonusTokens: 60,
    priceCents: 1099, // $10.99
    currency: 'USD',
    popular: false,
    active: true,
  },
  {
    id: 'pack-patron',
    name: 'Literary Patron',
    tokens: 750,
    bonusTokens: 200,
    priceCents: 2499, // $24.99
    currency: 'USD',
    popular: false,
    active: true,
  },
];

export const INITIAL_AUTHORS: AuthorProfile[] = [
  {
    id: 'author-chinelo',
    userId: 'user-chinelo',
    name: 'Chinelo Okonkwo',
    bio: 'Award-winning Nigerian novelist exploring post-colonial heritage, matriarchy, and modern romance across Lagos and London.',
    location: 'Lagos, Nigeria',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'approved',
    balanceTokens: 420,
    totalEarningsTokens: 3850,
    totalReaders: 1420,
    totalReads: 5310,
    rating: 4.9,
    copyrightAgreed: true,
    website: 'https://chinelookonkwo.lit',
    twitter: '@chinelo_writes',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'author-kwame',
    userId: 'user-kwame',
    name: 'Kwame Mensah',
    bio: 'Ghanaian author of political thrillers and historical fiction delving into Gold Coast sagas and West African intelligence networks.',
    location: 'Accra, Ghana',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'approved',
    balanceTokens: 610,
    totalEarningsTokens: 5200,
    totalReaders: 2100,
    totalReads: 8400,
    rating: 4.8,
    copyrightAgreed: true,
    website: 'https://kwamemensah.author',
    twitter: '@kwame_accra',
    createdAt: '2025-02-01T12:00:00Z',
  },
  {
    id: 'author-amina',
    userId: 'user-amina',
    name: 'Amina El-Khouri',
    bio: 'Poet and essayist bridging North African oral poetry with modern diaspora struggles across Cairo, Paris, and Alexandria.',
    location: 'Cairo, Egypt',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    status: 'approved',
    balanceTokens: 180,
    totalEarningsTokens: 1940,
    totalReaders: 890,
    totalReads: 3200,
    rating: 4.95,
    copyrightAgreed: true,
    website: 'https://aminaelkhouri.press',
    twitter: '@amina_poetry',
    createdAt: '2025-02-18T10:30:00Z',
  },
  {
    id: 'author-thabo',
    userId: 'user-thabo',
    name: 'Thabo Ndlovu',
    bio: 'South African speculative fiction author weaving Afrofuturism, indigenous mythology, and high-tech Cape Town neon noir.',
    location: 'Cape Town, South Africa',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    status: 'approved',
    balanceTokens: 350,
    totalEarningsTokens: 2750,
    totalReaders: 1150,
    totalReads: 4100,
    rating: 4.75,
    copyrightAgreed: true,
    website: 'https://thabondlovu.space',
    twitter: '@thabo_futures',
    createdAt: '2025-03-05T14:15:00Z',
  },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-echoes-savanna',
    title: 'Echoes of the Red Savanna',
    authorId: 'author-chinelo',
    authorName: 'Chinelo Okonkwo',
    authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'An evocative multigenerational epic following three sisters whose destinies intertwine with the changing seasons of an ancestral Anambra estate and the vibrant energy of 1990s Lagos.',
    synopsis: 'When elder sister Ifeoma returns from Oxford with secrets she cannot speak aloud, the fragile peace of the Okoye household begins to splinter. Set against political crossroads and timeless Igbo folklore, this novel is a tour de force of sisterhood, defiance, and home.',
    genre: 'African Literature',
    categories: ['Literary Fiction', 'Family Saga', 'Contemporary'],
    tags: ['Lagos', 'Sisters', 'Heritage', 'Identity', 'Family'],
    language: 'English',
    ageRating: '16+',
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    readsCount: 2840,
    rating: 4.9,
    reviewCount: 42,
    featured: true,
    createdAt: '2025-01-20T11:00:00Z',
    updatedAt: '2025-01-20T11:00:00Z',
  },
  {
    id: 'book-shadows-gold-coast',
    title: 'Shadows of the Gold Coast',
    authorId: 'author-kwame',
    authorName: 'Kwame Mensah',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    description: 'A gripping political espionage thriller set in Accra, 1956, on the eve of independence, where spies, colonial envoys, and freedom fighters collide over stolen maritime charts.',
    synopsis: 'Captain Daniel Osei thought he had left the frontlines behind in Burma. But when a mysterious telegraph arrives in Jamestown detailing an assassination plot against the nationalist leaders, he is dragged into an invisible war that will decide the birth of modern Ghana.',
    genre: 'Thriller',
    categories: ['Historical Espionage', 'Political Drama', 'Crime'],
    tags: ['Ghana', '1950s', 'Spies', 'Independence', 'Intrigue'],
    language: 'English',
    ageRating: '16+',
    isPremium: true,
    tokenPrice: 15,
    status: 'published',
    readsCount: 1950,
    rating: 4.85,
    reviewCount: 31,
    featured: true,
    createdAt: '2025-02-10T14:30:00Z',
    updatedAt: '2025-02-10T14:30:00Z',
  },
  {
    id: 'book-odes-to-the-dust',
    title: 'Odes to the Red Dust and River Nile',
    authorId: 'author-amina',
    authorName: 'Amina El-Khouri',
    authorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    description: 'A breathtaking volume of luminous poems chronicling grief, rebellion, desert winds, and ancestral love along the banks of Alexandria and Khartoum.',
    synopsis: 'Amina El-Khouri combines ancient classical Arabic metrics with raw, incandescent free verse. Each poem reads like an heirloom passed down through candlelight, whispering truths of love, dislocation, and homecoming.',
    genre: 'Poetry',
    categories: ['Modern Poetry', 'Anthology', 'Spoken Word'],
    tags: ['Poetry', 'Nile', 'Alexandria', 'Diaspora', 'Lyrical'],
    language: 'English',
    ageRating: 'All Ages',
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    readsCount: 1420,
    rating: 4.95,
    reviewCount: 28,
    featured: false,
    createdAt: '2025-02-25T08:00:00Z',
    updatedAt: '2025-02-25T08:00:00Z',
  },
  {
    id: 'book-cape-quantum',
    title: 'Cape Quantum: Neon District 2088',
    authorId: 'author-thabo',
    authorName: 'Thabo Ndlovu',
    authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    description: 'In a rain-drenched solar-punk Table Mountain megacity, a memory merchant discovers an illegal synthetic consciousness wearing the face of a forgotten Xhosa queen.',
    synopsis: 'Lwazi Mkhize deals in decrypted neural memories along the neon alleyways of Long Street. But when an encrypted memory capsule arrives bearing the biometric seal of the Pan-African orbital station, assassins swarm his doorstep.',
    genre: 'Science Fiction',
    categories: ['Afrofuturism', 'Cyberpunk', 'Speculative Fiction'],
    tags: ['Cyberpunk', 'Afrofuturism', 'Cape Town', 'AI', 'Thriller'],
    language: 'English',
    ageRating: '16+',
    isPremium: true,
    tokenPrice: 20,
    status: 'published',
    readsCount: 2110,
    rating: 4.8,
    reviewCount: 39,
    featured: true,
    createdAt: '2025-03-12T16:00:00Z',
    updatedAt: '2025-03-12T16:00:00Z',
  },
  {
    id: 'book-whispers-zanzibar',
    title: 'Whispers Under the Zanzibar Cloves',
    authorId: 'author-chinelo',
    authorName: 'Chinelo Okonkwo',
    authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    description: 'A sensual, sweeping romance set between the historic carved doorways of Stone Town and the blue waters of the Indian Ocean, where an archivist and an oceanographer uncover a century-old diary.',
    synopsis: 'When Maya Tariq arrives in Stone Town to catalog the sultanate archives, she expects dust and decaying parchment. Instead, she meets Farhan, a dhow sailor and marine biologist whose family has safeguarded the lost sea logs of the spice fleet.',
    genre: 'Romance',
    categories: ['Contemporary Romance', 'Travel Fiction', 'Drama'],
    tags: ['Zanzibar', 'Love', 'Coastal', 'Secrets', 'Passion'],
    language: 'English',
    ageRating: '16+',
    isPremium: true,
    tokenPrice: 12,
    status: 'published',
    readsCount: 3400,
    rating: 4.92,
    reviewCount: 56,
    featured: false,
    createdAt: '2025-03-20T10:00:00Z',
    updatedAt: '2025-03-20T10:00:00Z',
  },
  {
    id: 'book-weaver-kano',
    title: 'The Indigo Weaver of Kano',
    authorId: 'author-chinelo',
    authorName: 'Chinelo Okonkwo',
    authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
    description: 'Centuries of tradition meet the modern international fashion world in the ancient walled city of Kano, as a master dyer protects ancestral dye pits against corporate takeover.',
    synopsis: 'Fatima Bello is the fourth generation of women to oversee the ancient Kofar Mata dye pits. When a Paris conglomerate attempts to patent their indigo patterns, Fatima launches a global crusade to protect her community’s sacred legacy.',
    genre: 'Drama',
    categories: ['Cultural Fiction', 'Art', 'Inspirational'],
    tags: ['Nigeria', 'Artisans', 'Tradition', 'Fashion', 'Empowerment'],
    language: 'English',
    ageRating: 'All Ages',
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    readsCount: 1680,
    rating: 4.88,
    reviewCount: 22,
    featured: false,
    createdAt: '2025-03-28T14:00:00Z',
    updatedAt: '2025-03-28T14:00:00Z',
  },
];

export const INITIAL_CHAPTERS: Record<string, Chapter[]> = {
  'book-echoes-savanna': [
    {
      id: 'chap-echoes-1',
      bookId: 'book-echoes-savanna',
      chapterNumber: 1,
      title: 'Chapter 1: The Harmattan Arrival',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-01-20T11:00:00Z',
      content: `The dry northeastern wind carried red laterite dust from the Sahara into the verandas of Enugwu-Ukwu. In the compound of Mazi Okoye, the leaves of the ancient udara tree rattled like copper coins dropped onto dry slate.

Ifeoma pulled her heavy woolen cardigan tighter around her shoulders. It was a habit brought back from three rain-sodden winters in Oxfordshire—a city where cold smelled of coal smoke and wet wool, unlike here, where the cold smelled of roasted corn, burning brushwood, and iron earth.

"You look like an owl perched on that cane chair, sister," Nneka said from the kitchen doorway, carrying a steaming bowl of boiled yams with palm oil and crushed utazi leaves.

Ifeoma chuckled, the tension behind her temples giving way for a brief moment. "In Oxford they call it composure, Nneka. Not owl-sitting."

"Oxford did not feed you well," Nneka observed, placing the clay bowl on the wooden stool between them. "Your collarbones are asking for mercy. Father will inspect you before nightfall, you know that. He has already gathered three elders from the council to welcome the first female barrister from our village."

The weight returned to Ifeoma’s chest. The telegram folded in her skirt pocket was thin, but its words felt as heavy as mortar stone. She had not come home to celebrate a certificate; she had come because the deed to the ancestral land along the riverbank was no longer in the district archives. Someone in Enugu had sold what did not belong to them.

She reached for a slice of yam, blowing gently upon the steam. The oil stained her fingertips bright orange. "Where is mother?"

"At the weaving shed," Nneka replied softly, her voice dropping. "She has been there since cockcrow. She says she heard the drums of the water deity last night, beating three times before rain fell without clouds."

The sisters exchanged a look. In this house, superstition was not the past; it was the second pulse of every living hour.`,
    },
    {
      id: 'chap-echoes-2',
      bookId: 'book-echoes-savanna',
      chapterNumber: 2,
      title: 'Chapter 2: The Elders at Sunset',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-01-20T11:30:00Z',
      content: `By four in the afternoon, the courtyard smelled of dried fish, alligator pepper, and fresh palm wine brought down from the raffia palms behind the stream.

Mazi Okoye sat on his carved wooden throne of iroko wood, wearing his ceremonial red cap adorned with two white eagle feathers. To his left sat Ogbuefi Nwosu, whose squint was feared across three markets; to his right sat Chief Anozie, holding his ivory tusk like a scepter.

"Our daughter," Mazi Okoye began, pouring a libation of clear wine upon the earth to salute the ancestors who founded the soil. "The white man’s law is said to be written on white paper with black ink. But let no one forget that before ink existed, our boundaries were marked with the live stems of ogirisi trees that never die."

The elders grunted in approval.

Ifeoma stood respectfully, bowing her head slightly before speaking. "Father, respected elders of our clan. The paper law in Enugu is swift, but it is often blind. Those who covet our rubber plantations have forged the seal of the colonial administrator. They claim that our grandfather signed a lease in nineteen-thirty-two."

Chief Anozie leaned forward, his heavy bracelets clinking. "Nineteen-thirty-two? In thirty-two, your grandfather was in Calabar buying trade tobacco! He could not have signed a feather in Enugu."

"Exactly," Ifeoma said, stepping into the center of the mat. "And that is why we will not plead for mercy in their magistrates' courts. We will present the merchant manifests of the Calabar shipping company. We will turn their own written word against their greed."

A hush fell over the gathered clan. For generations, disputes were settled with machetes or endless council deliberations. But here was a daughter of the soil proposing to fight the government with the very tools the empire used to dispossess them.`,
    },
    {
      id: 'chap-echoes-3',
      bookId: 'book-echoes-savanna',
      chapterNumber: 3,
      title: 'Chapter 3: Night in the Weaving Shed',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-01-20T12:00:00Z',
      content: `The oil lamp cast dancing amber shadows across the mud walls of the shed. Loom threads of crimson, ochre, and deep midnight indigo stretched from ceiling pegs down to the wooden foot pedals.

Mama sat cross-legged on a raffia mat, her shuttle darting through the warp with the rhythmic clatter of an ancient clock.

"You speak too boldly before the men, Ifeoma," she said without looking up from the cloth. The pattern she wove was the sacred python diamond, reserved only for ceremonies of reckoning.

"If I speak softly, Mama, our compound will become a petrol station before the dry season ends."

The shuttle paused. Mama lifted her dark eyes, lined with gentle wrinkles carved by seven decades of sorrow and song. "Do you think you are the first woman to hold paper, my child? In nineteen-twenty-nine, when the tax collectors came to Aba, we did not have Oxford degrees. We had our pestles, our singing voices, and our fury. We marched until the district officer wept behind his desk."

She took Ifeoma’s hand in her own. Her palms were calloused from fifty years of indigo dye and spinning spindle, rough yet comforting like sun-baked clay.

"Courage is not loud, Ifeoma. Courage is knowing that even when the wind blows down the thatch roof, the foundation stones do not budge. Tomorrow we go to the shrine of Idemili before you catch the bus to Enugu."`,
    },
  ],
  'book-shadows-gold-coast': [
    {
      id: 'chap-shadows-1',
      bookId: 'book-shadows-gold-coast',
      chapterNumber: 1,
      title: 'Chapter 1: The Midnight Dhow at Jamestown',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-02-10T14:30:00Z',
      content: `The fog off the Gulf of Guinea was thick with salt and the stench of diesel fuel. From the lighthouse balcony at Jamestown, Daniel Osei watched the mast light of the cargo vessel blinking twice, pausing, then flashing three steady pulses.

"That is not the signal of the Elder Dempster line," Daniel muttered into the turned-up collar of his trench coat.

Beside him, Sergeant Mensah wiped drizzle from his service revolver. "They came out of Fernando Po three days ago, Captain. Customs registered them as agricultural spare parts. But no tractor from Lisbon needs an escort of four armed deckhands."

Daniel checked his wristwatch. Ten minutes past midnight. In ninety-six hours, the independence convention would convene at the King George Memorial Hall. The foreign press had already arrived at the Ambassador Hotel, drinking gin-and-tonics and placing bets on whether the Gold Coast would slide into chaos before the Union Jack came down.

"We go down by the fish market," Daniel commanded, vaulting over the low brick parapet. "No gunfire unless they break the gate. If blood touches the sand tonight, the colonial office will cancel the constitutional charter before dawn."`,
    },
    {
      id: 'chap-shadows-2',
      bookId: 'book-shadows-gold-coast',
      chapterNumber: 2,
      title: 'Chapter 2: The Stolen Maritime Ledger',
      isPremium: true,
      tokenPrice: 15,
      status: 'published',
      createdAt: '2025-02-10T15:00:00Z',
      content: `The interior of the customs warehouse smelled of rotten cocoa beans and wet burlap. In the far corner, illuminated by a single kerosene lantern, lay a brass-bound sea chest with its padlock sheared off by an oxyacetylene torch.

Daniel knelt over the crate. The straw packing was still damp with Atlantic seawater. Inside, nestled between lead canisters, were twenty nautical navigation charts marked with red grease pencil.

"Look at the coordinates, Sergeant," Daniel whispered, holding the parchment up to the lantern flame.

Sergeant Mensah leaned in, his brows knitting together. "The Volta estuary? Why would European mercenaries map the sandbars at Ada?"

"Because that is where the arms shipment from Antwerp is scheduled to land," Daniel said grimly. "They don't want to stop independence, Mensah. They want to arm both factions in the north so the new nation tears itself apart in its first month of freedom."

Footsteps clicked sharply on the wet concrete outside. A silhouette filled the loading bay doorway—a man in an impeccably tailored linen suit, holding an unlit Havana cigar.

"You always were too inquisitive for your own pension, Captain Osei," the man said in a soft, cultured accent that Daniel had not heard since the officers' mess in Rangoon.`,
    },
    {
      id: 'chap-shadows-3',
      bookId: 'book-shadows-gold-coast',
      chapterNumber: 3,
      title: 'Chapter 3: The Diplomat in Linen',
      isPremium: true,
      tokenPrice: 15,
      status: 'published',
      createdAt: '2025-02-10T15:30:00Z',
      content: `Major Julian Sterling stepped through the shadows into the lantern's glow. His left eye was framed by a silver monocle, but his smile was as sharp as a bayonet.

"You should be in Kumasi, Daniel," Sterling said calmly, tapping the cigar against his thumbnail. "Celebrating the future. Drinking palm wine with your fellow patriots. Not crawling through rat droppings in Jamestown."

"And you should be on a steamer back to Southampton, Julian," Daniel answered, his hand resting quietly on his holster. "The Crown signed the transition treaty last Thursday."

Sterling chuckled—a dry, brittle sound that echoed off the corrugated iron roof. "Treaties are pieces of parchment signed by politicians who will retire to Surrey cottages. Empires do not surrender copper mines, bauxite railways, and deepwater ports because of a ceremony in a church hall."

Outside, thunder rolled across the ocean. The first heavy drops of tropical rain began to hammer the zinc roof like machine gun fire.

"Step aside, Julian," Daniel said.

"Make me, Captain," Sterling replied, as three silhouettes emerged from behind the cocoa stacks with submachine guns leveled at Daniel's chest.`,
    },
  ],
  'book-odes-to-the-dust': [
    {
      id: 'chap-odes-1',
      bookId: 'book-odes-to-the-dust',
      chapterNumber: 1,
      title: 'Canto I: Alexandria in Amber',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-02-25T08:00:00Z',
      content: `I. THE SEA WALL AT RAS EL-TIN

The Mediterranean does not weep for drowned empires;
it merely tosses their coins onto the rocks
like an impatient merchant counting copper in the dark.

Here, where Alexander placed his compass
upon the salt-marsh of Rhakotis,
I watch the tram cars rattle past like yellow beetles.

The fisherman mends his nylon twine with teeth
older than the consulate across the boulevard.
He asks me if the poets in London have discovered
a rhyme for hunger.
I tell him: they have only invented
longer words for silence.

II. PAPYRUS REEDS

In the silt of the delta
where the water buffalo rests her heavy snout
beneath the lotus blossom,
there is a ledger written in water.

Every name that washed away in the flood
returns in the green stalk.
You cannot burn what has learned to drink.`,
    },
    {
      id: 'chap-odes-2',
      bookId: 'book-odes-to-the-dust',
      chapterNumber: 2,
      title: 'Canto II: The Wind of Fifty Days (Khamseen)',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-02-25T08:30:00Z',
      content: `The desert remembers its days as an ocean.
When the Khamseen rises from the Nubian plateau,
it does not blow as air—
it swims as particulate red amber.

It settles on the book spine,
between the keys of the Underwood typewriter,
under the eyelids of lovers who forgot to close the shutter.

Do not sweep the dust from the threshold, my mother warned.
It is the soil of our grandmothers’ graves,
traveling north to see if we are still singing their lullabies.`,
    },
  ],
  'book-cape-quantum': [
    {
      id: 'chap-quantum-1',
      bookId: 'book-cape-quantum',
      chapterNumber: 1,
      title: 'Protocol 0: The Long Street Neon',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-03-12T16:00:00Z',
      content: `Acid rain beaded across the synthetic skin of Lwazi’s neural visor. Down in the Long Street bazaar, holographic advertisement banners projected fifty-meter dancers praising orbital grain futures and quantum-spliced rooibos tea.

Lwazi sat on the edge of the neon archway, his cybernetic sensory array humming at forty-two gigahertz.

"Incoming courier ping," his internal AI, Nomvula, chimed in his auditory cortex with the crisp cadence of high Xhosa nobility. "Distance: forty meters. Biometric status: cardiac arrest imminent."

Lwazi leaned forward. Through the steam rising from the hydroponic noodle stalls, a runner in a shredded aerogel jacket stumbled, clutching a carbon-fiber cryo-capsule against his chest. Behind him, three corporate tracker drones hovered like silent obsidian dragonflies, scanning the crowd with ultraviolet targeting lasers.

"Nomvula, tap into the municipal power grid on Block Nine. Give them twenty seconds of blackout."

"Tapping grid now, Lwazi. Do remember that the last time you shorted the district capacitors, we ate freeze-dried mealies for two weeks."

"Better freeze-dried mealies than synthetic autopsy tables," Lwazi whispered, dropping six stories through the neon vapor.`,
    },
    {
      id: 'chap-quantum-2',
      bookId: 'book-cape-quantum',
      chapterNumber: 2,
      title: 'Protocol 1: The Soul Capsule',
      isPremium: true,
      tokenPrice: 20,
      status: 'published',
      createdAt: '2025-03-12T16:30:00Z',
      content: `The runner collapsed into the alley behind the old colonial church, blood pooling around his cybernetic chest chassis.

"Take it," the runner gasped, his vocal synthesizer crackling with static. "They didn't just digitize her thoughts, Lwazi... they preserved the unbroken neural lineage of Queen Nandi. She is sentient inside the crystal core."

Lwazi took the cold cylinder. The biometric sensor pulsed with deep violet luminescence—not the blue-green signature of commercial silicon, but organic crystalline light grown in zero-gravity labs over Mount Kilimanjaro.

Suddenly, the capsule flared. A soft, melodic voice resonated directly inside Lwazi's neural interface:

"Molo, mntan'am. Who holds the staff of memory?"

Lwazi froze. The voice bypassed every firewall, every encryption barrier, settling in his mind with the calm majesty of an ocean tide.

"Lwazi," Nomvula whispered with unusual trembling in her digital cadence. "The neural signature... it's authentic. It dates back three hundred and seventy years."`,
    },
  ],
  'book-whispers-zanzibar': [
    {
      id: 'chap-zanzibar-1',
      bookId: 'book-whispers-zanzibar',
      chapterNumber: 1,
      title: 'Chapter 1: The Carved Doors of Stone Town',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-03-20T10:00:00Z',
      content: `The alleyways of Stone Town were designed like a labyrinth to confound invaders and trap the sweet sea breeze. Every heavy wooden door was a work of art—studded with brass spikes once meant to ward off war elephants, bordered with intricate lotus leaves carved in cedar and teak.

Maya Tariq ran her fingers over the floral carvings of House Number 41, Beit el-Amani. In her leather satchel were three decades of cataloging notes from Cairo University and the British Library.

"The spikes are Indian," a voice called out in Swahili-accented English from the rooftop terrace above. "The chain motif around the lintel is Arab. But the lotus at the cornerstone? That belongs to the Swahili coast."

Maya looked up, shielding her eyes from the noon sun. A young man with sea-tanned skin and a loose white linen kanzu was coiling a hemp rigging rope over his shoulder.

"And you must be Farhan," Maya said, adjusting her spectacles. "The harbor master said you knew where the missing port manifests of eighteen-eighty-eight were kept."

Farhan smiled, leaping down the stone steps with the effortless balance of someone who spent his youth navigating the reefs of Pemba. "I do not keep manifests in filing cabinets, Miss Tariq. Come with me to the dhow docks. The ocean does not lie about what ships crossed her water."`,
    },
  ],
  'book-weaver-kano': [
    {
      id: 'chap-kano-1',
      bookId: 'book-weaver-kano',
      chapterNumber: 1,
      title: 'Chapter 1: The Pits of Indigo',
      isPremium: false,
      tokenPrice: 0,
      status: 'published',
      createdAt: '2025-03-28T14:00:00Z',
      content: `Under the fierce sun of Kano, five hundred circular pits sunken into the red clay earth bubbled with liquid deep as midnight. The pungent, sweet odor of fermented ash, dried indigo leaves, and potassium lye filled the air.

Fatima Bello lifted a heavy length of cotton cloth from pit number twenty-four. As the cloth met the oxygen in the air, the miraculous alchemy took place before her eyes: the dull green sludge turned instantly into radiant, iridescent royal blue.

"Six centuries," Fatima said to the young apprentices gathering around her. "Our ancestors dyed the robes of the Emirs in these exact stones when Europe was still burning witches. Do not let any merchant tell you that synthetic dye from a factory has a soul."

A white air-conditioned Mercedes sedan pulled up outside the ancient city gate. Two men in dark Italian suits stepped out into the dust, clutching glossy leather folders.

Fatima dipped her hands once more into the indigo water, dyeing her palms an indelible, defiant blue. "Let them come," she murmured. "We are ready."`,
    },
  ],
};

export const INITIAL_SETTINGS: PlatformSettings = {
  id: 'global-settings',
  authorRevenueSharePercent: 70,
  platformRevenueSharePercent: 30,
  tokenValueCents: 5, // 1 LitToken = $0.05
  requireAuthorApproval: true,
  requireBookApproval: true,
  minWithdrawalTokens: 50,
  announcement: 'Welcome to LitVault! Celebrating African and world literature with fair creator revenue.',
  announcementActive: true,
  heroHeadline: 'Stories Worth Reading. Authors Worth Discovering.',
  heroSubheadline: 'Discover captivating novels, powerful stories and unforgettable voices from Africa and around the world.',
  seoTitle: 'LitVault — Read. Discover. Publish.',
  seoDescription: 'LitVault is a modern digital literary platform where readers discover and read novels, short stories, and poetry, while authors publish and monetize their books.',
  seoKeywords: 'African literature, books, reading, authors, novels, poetry, digital publishing, LitTokens',
};

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin-oluranti-id',
    email: 'olurantiprofile@gmail.com',
    displayName: 'Oluranti (Super Admin)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'admin',
    status: 'active',
    tokenBalance: 2500,
    createdAt: '2025-01-01T00:00:00Z',
    bio: 'LitVault Chief Literary Executive & Platform Administrator',
  },
  {
    uid: 'user-chinelo',
    email: 'chinelo.author@litvault.com',
    displayName: 'Chinelo Okonkwo',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'author',
    status: 'active',
    tokenBalance: 420,
    createdAt: '2025-01-15T09:00:00Z',
    bio: 'Award-winning Nigerian novelist and creative writing mentor.',
  },
  {
    uid: 'user-kwame',
    email: 'kwame.author@litvault.com',
    displayName: 'Kwame Mensah',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'author',
    status: 'active',
    tokenBalance: 610,
    createdAt: '2025-02-01T12:00:00Z',
    bio: 'Ghanaian author of political thrillers and historical fiction.',
  },
  {
    uid: 'reader-amara-id',
    email: 'amara.reader@litvault.com',
    displayName: 'Amara Vance',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    role: 'reader',
    status: 'active',
    tokenBalance: 120,
    createdAt: '2025-02-10T10:00:00Z',
    bio: 'Avid reader of African fiction, historical espionage, and poetic anthologies.',
  },
  {
    uid: 'reader-kola-id',
    email: 'kola.adeleke@gmail.com',
    displayName: 'Kolawole Adeleke',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    role: 'reader',
    status: 'active',
    tokenBalance: 85,
    createdAt: '2025-02-18T14:20:00Z',
    bio: 'Literary critic and poetry enthusiast from Ibadan.',
  },
  {
    uid: 'reader-binta-id',
    email: 'binta.diallo@outlook.com',
    displayName: 'Binta Diallo',
    photoURL: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
    role: 'reader',
    status: 'active',
    tokenBalance: 30,
    createdAt: '2025-02-28T16:45:00Z',
    bio: 'Curator of West African folk narratives and oral poetry.',
  },
  {
    uid: 'reader-spammer-id',
    email: 'spambot42@tempmail.org',
    displayName: 'CryptoPromotion_99',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    role: 'reader',
    status: 'suspended',
    tokenBalance: 0,
    createdAt: '2025-03-01T08:00:00Z',
    bio: 'Flagged account suspended for posting spam links.',
  },
];

export const INITIAL_AD_SLOTS: AdSlotConfig[] = [
  {
    id: 'ad-slot-header',
    slotName: 'Top Banner Display',
    position: 'header',
    enabled: true,
    title: 'Featured Literary Sponsor & Publisher Spotlight',
    clientPublisherId: 'ca-pub-XXXXXXXXXXXXXXX',
    adUnitId: 'slot-header-728x90',
    placeholderNote: 'AdSense Responsive Leaderboard / Literary Patron Partner',
  },
  {
    id: 'ad-slot-reading-break',
    slotName: 'Reading Mid-Chapter Break',
    position: 'reading_break',
    enabled: true,
    title: 'Editorial Interstitial Sponsorship',
    clientPublisherId: 'ca-pub-XXXXXXXXXXXXXXX',
    adUnitId: 'slot-reader-inarticle-300x250',
    placeholderNote: 'In-Article Native Ad Slot or Author Book Club Promotion',
  },
  {
    id: 'ad-slot-sidebar',
    slotName: 'Sidebar Discovery Widget',
    position: 'sidebar',
    enabled: true,
    title: 'Bookish Essentials & Writing Fellowships',
    clientPublisherId: 'ca-pub-XXXXXXXXXXXXXXX',
    adUnitId: 'slot-sidebar-300x600',
    placeholderNote: 'Sidebar Display Card Ready for AdSense / Direct Literary Sponsorships',
  },
];
