import * as mongoose from 'mongoose';

export default {
    bootStrapSite
};

function bootStrapSite() {
    let categories = [
        {
            "title": "All",
            "alias": "all",
            "end": true
        },
        {
            "title": "Sports & Fitness",
            "alias": "sportsfitness",
            "end": true
        },
        {
            "alias": "healthbeauty",
            "title": "Health & Beauty",
            "end": false
        },
        {
            "alias": "dealsgifts",
            "title": "Deals & Gifts",
            "end": true
        },
        {
            "alias": "booksmusictv",
            "title": "Books, Music & TV",
            "end": true
        },
        {
            "alias": "traveleventsactivities",
            "title": "Travel, Events & Activites",
            "end": true
        },
        {
            "alias": "babychildren",
            "title": "Babies & Children",
            "end": false
        },
        {
            "alias": "entertainment",
            "title": "Entertainment",

            "end": false
        },
        {
            "alias": "fashion",
            "title": "Fashion",
            "end": false
        },
        {
            "alias": "technology",
            "title": "Technology",
            "end": false
        },
        {
            "alias": "artscollectables",
            "title": "Arts & Collectibles",
            "end": false
        },
        {
            "alias": "homegarden",
            "title": "Home & Garden",
            "end": false
        },
        {
            "alias": "foodwine",
            "title": "Food & Wine",
            "end": false
        }
    ];

    let primaryCategories = [
        {
            "name": "Food & Wine",
            "alias": "foodwine",
            "end": true,
            "categories": {
                "food": "Food",
                "wine": "Wine"
            }
        },
        {
            "name": "Home & Garden",
            "alias": "homegarden",
            "end": true,
            "categories": {
                "appliances": "Appliances",
                "bedbath": "Bed & Bath",
                "decor": "Decor",
                "furniture": "Furniture",
                "kitchendining": "Kitchen & Dining",
                "luggage": "Luggage",
                "outdoor": "Outdoor",
                "pets": "Pets"
            }
        },
        {
            "name": "Arts & Collectables",
            "alias": "artscollectables",
            "end": true,
            "categories": {
                "antiques": "Antiques",
                "arts": "Arts",
                "collectables": "Collectables",
                "entertainmentmemorabilia": "Entertainment Memorabilia",
                "otheratscollectables": "Other Arts & Collectables"
            }
        },
        {
            "name": "Technology",
            "alias": "technology",
            "end": false,
            "categories": {
                "cameras": "Cameras",
                "computerstablets": "Computers & Tablets",
                "phones": "Phones",
                "wearable": "Wearable",
                "other": "Other"
            }
        },
        {
            "name": "Entertainment",
            "alias": "entertainment",
            "end": true,
            "categories": {
                "homeentertainment": "Home Entertainment",
                "gaming": "Gaming"
            }
        },
        {
            "alias": "healthbeauty",
            "name": "Health & Beauty",
            "end": true,
            "categories": {
                "fragrances": "Fragrances",
                "haircareandgrooming": "Hair Care & Grooming",
                "healthcare": "Health Care",
                "makeupskincare": "Make-up & Skin Care",
                "otherhealthbeauty": "Other Health & Beauty"
            }
        },
        {
            "alias": "fashion",
            "name": "Fahsion",
            "end": false,
            "categories": {
                "boysgirls": "Boys & Girls",
                "mensclothing": "Men's Clothing",
                "mensstyle": "Men's Style",
                "womensclothing": "Women's Clothing",
                "womensstyle": "Women's Style"
            }
        },
        {
            "alias": "babychildren",
            "name": "Babies & Children",
            "end": true,
            "categories": {
                "babychildrenclothing": "Baby & Children Clothing",
                "nursery": "Nursery",
                "babygear": "Baby Gear",
                "beddingdecor": "Bedding & Decor",
                "babycare": "Baby Care",
                "kidsfurniture": "Kids Furniture",
                "babytoysactivities": "Baby Toys & Activities"
            }
        }];

    let secondaryCategories = [
        {
            "alias": "wearable",
            "name": "Wearable",
            "end": false,
            "categories": {
                "headphones": "Headphones",
                "mp3players": "MP3 Players",
                "watches": "Watches"
            }
        },
        {
            "alias": "phones",
            "name": "Phones",
            "end": false,
            "categories": {
                "phonesaccessories": "Accessories",
                "mobilephones": "Mobile Phones",
                "partscomponents": "Parts & Components"
            }
        },
        {
            "alias": "cameras",
            "name": "Cameras",
            "end": false,
            "categories": {
                "cameraaccessories": "Accessories",
                "action": "Action",
                "compact": "Compact",
                "dash": "Dash",
                "dslr": "DSLR",
                "film": "Film",
                "video": "Video"
            }
        },
        {
            "alias": "computerstablets",
            "name": "Computers & Tablets",
            "end": false,
            "categories": {
                "bitcoinmining": "Bitcoin Mining",
                "desktoppc": "Desktop PC",
                "gamessoftware": "Games & Software",
                "hardware": "Hardware",
                "laptopsnotebooks": "Laptops & Notebooks",
                "monitorsscreens": "Monitors & Screens",
                "networking": "Networking",
                "peripherals": "Peripherals",
                "printersink": "Printers & Ink",
                "scanners": "Scanners",
                "storage": "Storage",
                "tablets": "Tablets"
            }
        },
        {
            "alias": "boysgirls",
            "name": "Boys & Girls",
            "end": false,
            "categories": {
                "boys": "Boys",
                "girls": "Girls"
            }
        },
        {
            "alias": "mensclothing",
            "name": "Men's Clothing",
            "end": false,
            "categories": {
                "menscostumes": "Costumes",
                "mensjeanstrousers": "Jeans & Trousers",
                "mensjackets": "Jackets",
                "mensjerseyshoodies": "Jerseys & Hoodies",
                "mensnoveltyadult": "Novelty & Adult",
                "mensshoes": "Shoes",
                "mensshorts": "Shorts",
                "menssocks": "Socks",
                "menssportswear": "Sportswear",
                "menssuits": "Suits",
                "mensswimwear": "Swimwear",
                "menstopsshirts": "Tops & Shirts",
                "menstshirts": "T-shirts",
                "mensother": "Other",
                "menswedding": "Wedding",
                "mensunderwear": "Underwear"
            }
        },
        {
            "alias": "womensclothing",
            "name": "Womens's Clothing",
            "end": false,
            "categories": {
                "womenscostumes": "Costumes",
                "womensdresss": "Dresses",
                "womensjeanspantsandshorts": "Jeans, Pants & Trousers",
                "womensjackets": "Jackets",
                "womenslingeriesleepware": "Lingerie & Sleepwear",
                "womensmaternity": "Maternity",
                "womensnoveltyadult": "Novelty & Adult",
                "womensshoes": "Shoes",
                "womensskirts": "Skirts",
                "womenssportswear": "Sportswear",
                "womenssuits": "Suits",
                "womensswimwear": "Swimwear",
                "womenstopsshirts": "Tops & Shirts",
                "womenswedding": "Wedding",
                "womenssother": "Other",
                "womensvintageretro": "Vintage & Retro"
            }
        },
        {
            "alias": "womensstyle",
            "name": "Womens's Style",
            "end": false,
            "categories": {
                "womensaccessories": "Accessories",
                "womensweddingaccessories": "Wedding Accessories"
            }
        },
        {
            "alias": "mensstyle",
            "name": "Men's Style",
            "end": true
        }];

    let tertiarycategories = [
        {
            "name": "mensstyle",
            "categories": {
                "beltsbuckles": "Belts & Buckles",
                "cufflinks": "Cuff-links",
                "gloves": "Gloves",
                "hatscaps": "Hats & Caps",
                "scarves": "Scarves",
                "socks": "Socks",
                "sunglasseseyewear": "Sunglasses & Eye-wear",
                "tieshandkerchiefs": "Ties & Handkerchiefs",
                "walletsbags": "Wallets & Bags",
                "umbrellas": "Umbrellas"
            }
        },
        {
            "name": "sportsfitness",
            "categories": {
                "bicycles": "Bicycles",
                "boxingmartialarts": "Boxing & Martial Arts",
                "campinghiking": "Camping & Hiking",
                "fishing": "Fishing",
                "golf": "Golf",
                "gymfitness": "Gym & Fitness",
                "racquetsports": "Racquet Sports",
                "skateboardsrollerblades": "Skateboards & Rollerblades",
                "snowsports": "Snow Sports",
                "sportsbags": "Sports Bags",
                "surfing": "Surfing",
                "othersportsfitness": "Other Sports & Fitness"
            }
        },
        {
            "name": "fragrances",
            "categories": {
                "fragrancegiftsets": "Fragrance Gift Sets",
                "fragranceminiatures": "Fragrance Miniatures",
                "mensfragrances": "Men's Fragrances",
                "womensfragrances": "Women's Fragrances"
            }
        },
        {
            "name": "haircareandgrooming",
            "categories": {
                "hairaccessories": "Hair Accessories",
                "haircareproducts": "Hair Care Products",
                "hairdryers": "Hair Dryers",
                "hairstraightenersstylers": "Hair Straighteners & Stylers",
                "scissorsclippers": "Scissors & Clippers",
                "shavinghairremoval": "Shaving & Hair Removal"
            }
        },
        {
            "name": "healthcare",
            "categories": {
                "medicalsupplies": "Medical Supplies",
                "naturopathy": "Naturopathy",
                "pregnancymaternity": "Pregnancy & Maternity",
                "relaxationhypnosis": "Relaxation & Hypnosis",
                "weightloss": "Weight Loss"
            }
        },
        {
            "name": "makeupskincare",
            "categories": {
                "bathshower": "Bath & Shower",
                "bodymoisturisers": "Body Moisturisers",
                "facecare": "Face Care",
                "handfootcare": "Hand & Foot Care",
                "makeup": "Make-up",
                "suncaretanning": "Sun Care & Tanning"
            }
        },
        {
            "name": "otherhealthbeauty",
            "categories": {
                "giftpacks": "Gift Packs",
                "glassescontacts": "Glasses & Contacts",
                "massage": "Massage",
                "mobilityaids": "Mobility Aids",
                "personalhygiene": "Personal Hygiene",
                "other": "Other"
            }
        },
        {
            "name": "dealsgifts",
            "categories": {
                "dealsgifts": "Deals & Gifts"
            }
        },
        {
            "name": "booksmusictv",
            "categories": {
                "boardgames": "Board Games",
                "books": "Books",
                "cdsdvds": "CDs & DVDs",
                "musicalinstruments": "Musical Instruments",
                "otherbooksmusictv": "Other Books, Music & TV"
            }
        },
        {
            "name": "girls",
            "categories": {
                "accessories": "Accessories",
                "costumes": "Costumes",
                "dressesskirts": "Dresses & Skirts",
                "jackets": "Jackets",
                "jeanstrousers": "Jeans & Trousers",
                "jerseyshoodies": "Jerseys & Hoodies",
                "pyjamas": "Pyjamas",
                "shoes": "Shoes",
                "shorts": "Shorts",
                "socks": "Socks",
                "swimwear": "Swimwear",
                "topstshirts": "Tops & T-shirts",
                "underwear": "Underwear",
                "uniform": "Uniform",
                "wedding": "Wedding",
                "other": "Other"
            }
        },
        {
            "name": "boys",
            "categories": {
                "accessories": "Accessories",
                "costumes": "Costumes",
                "jackets": "Jackets",
                "jeanstrousers": "Jeans & Trousers",
                "jerseyshoodies": "Jerseys & Hoodies",
                "pyjamas": "Pyjamas",
                "shoes": "Shoes",
                "shorts": "Shorts",
                "socks": "Socks",
                "swimwear": "Swimwear",
                "topstshirts": "Tops & T-shirts",
                "underwear": "Underwear",
                "uniform": "Uniform",
                "wedding": "Wedding",
                "other": "Other"
            }
        },
        {
            "name": "menscostumes",
            "categories": {
                "fullcostumes": "Full Costumes",
                "masks": "Masks",
                "nationaldress": "National Dress",
                "wigs": "Wigs",
                "other": "Other"
            }
        },
        {
            "name": "mensjackets",
            "categories": {
                "jackets": "Jackets"
            }
        },
        {
            "name": "mensjeanstrousers",
            "categories": {
                "jeans": "Jeans",
                "trousers": "Trousers"
            }
        },
        {
            "name": "mensjerseyshoodies",
            "categories": {
                "jerseys": "Jerseys",
                "hoodies": "Hoodies"
            }
        },
        {
            "name": "mensnoveltyadult",
            "categories": {
                "noveltyadult": "Novelty & Adult"
            }
        },
        {
            "name": "mensshoes",
            "categories": {
                "boots": "Boots",
                "casual": "Casual",
                "dress": "Dress",
                "sandalsflipflops": "Sandals & Flip-flops",
                "sports": "Sports",
                "other": "Other"
            }
        },
        {
            "name": "mensshorts",
            "categories": {
                "shorts": "Shorts"
            }
        },
        {
            "name": "mensother",
            "categories": {
                "socks": "Socks"
            }
        },
        {
            "name": "menssportswear",
            "categories": {
                "sportswear": "Sportswear"
            }
        },
        {
            "name": "menssuits",
            "categories": {
                "suits": "Suits"
            }
        },
        {
            "name": "mensswimwear",
            "categories": {
                "swimwear": "Swimwear"
            }
        },
        {
            "name": "menstopsshirts",
            "categories": {
                "tops": "Tops",
                "shirts": "Shirts"
            }
        },
        {
            "name": "menstshirts",
            "categories": {
                "tshirts": "T-shirts"
            }
        },
        {
            "name": "mensother",
            "categories": {
                "other": "Other"
            }
        },
        {
            "name": "menswedding",
            "categories": {
                "wedding": "Wedding"
            }
        },
        {
            "name": "mensunderwear",
            "categories": {
                "underwear": "Underwear"
            }
        },
        {
            "name": "mensstyle",
            "categories": {
                "beltsbuckles": "Belts & Buckles",
                "cufflinks": "Cuff-links",
                "gloves": "Gloves",
                "hatscaps": "Hats & Caps",
                "scarves": "Scarves",
                "socks": "Socks",
                "sunglasseseyewear": "Sunglasses & Eye-wear",
                "tieshandkerchiefs": "Ties & Handkerchiefs",
                "walletsbags": "Wallets & Bags",
                "umbrellas": "Umbrellas"
            }
        },
        {
            "name": "womenscostumes",
            "categories": {
                "fullcostumes": "Full Costumes",
                "masks": "Masks",
                "nationaldress": "National Dress",
                "wigs": "Wigs",
                "other": "Other"
            }
        },
        {
            "name": "womensdresses",
            "categories": {
                "casual": "Casual",
                "evening": "Evening",
                "other": "Other"
            }
        },
        {
            "name": "womensjackets",
            "categories": {
                "blazer": "Blazer",
                "coat": "Coat",
                "denim": "Denim",
                "parka": "Parka",
                "ski": "Ski",
                "other": "Other"
            }
        },
        {
            "name": "womensjeanspantsshorts",
            "categories": {
                "jeans": "Jeans",
                "pants": "Pants",
                "shorts": "Shorts",
                "other": "Other"
            }
        },
        {
            "name": "womenslingerieseepwear",
            "categories": {
                "bras": "Bras",
                "chemisescamisoles": "Chemises & Camisoles",
                "briefsgstring": "Briefs & G-string",
                "pantihose": "Pantihose",
                "sets": "Sets",
                "sleepwear": "Sleepwear",
                "other": "Other"
            }
        },
        {
            "name": "womensmaternity",
            "categories": {
                "bras": "Bras",
                "briefsbellybelts": "Briefs & Belly Belts",
                "dresses": "Dresses",
                "jeanspantsleggings": "Jeans, Pants & Leggings",
                "shorts": "Shorts",
                "skirts": "Skirts",
                "tops": "Tops",
                "other": "Other"
            }
        },
        {
            "name": "womensnoveltyadult",
            "categories": {
                "noveltyadult": "Novelty & Adult"
            }
        },
        {
            "name": "womensshoes",
            "categories": {
                "boots": "Boots",
                "flats": "Flats",
                "heels": "Heels",
                "sandalsflipflops": "Sandals & Flip-flops",
                "slippers": "Slippers",
                "sports": "Sports",
                "other": "Other"
            }
        },
        {
            "name": "womensskirts",
            "categories": {
                "mini": "Mini",
                "kneelength": "Knee Length",
                "34length": "3/4 Length",
                "fulllength": "Full Length",
                "other": "Other"
            }
        },
        {
            "name": "womenssportswear",
            "categories": {
                "fulltracksuits": "Full Tracksuits",
                "jackets": "Jackets",
                "pantstights": "Pants & Tights",
                "shorts": "Shorts",
                "singlets": "Singlets",
                "sportsbras": "Sports Bras",
                "topstshirts": "Tops & T-shirts",
                "other": "Other"
            }
        },
        {
            "name": "womenssuits",
            "categories": {
                "suits": "Suits"
            }

        },
        {
            "name": "womensswimwear",
            "categories": {
                "swimwear": "Swimwear"
            }
        },
        {
            "name": "womenstopsshirts",
            "categories": {
                "34sleeve": "3/4 Sleeve",
                "cardigan": "Cardigan",
                "halter": "Halter",
                "jumpersjerseys": "Jumpers & Jerseys",
                "longsleeve": "Long Sleeve",
                "strapless": "Strapless",
                "sweatshirtshoodies": "Sweatshirts & Hoodies",
                "other": "Other"
            }
        },
        {
            "name": "womensvintageretro",
            "categories": {
                "womensvintageretro": "Vintage & Retro"
            }
        },
        {
            "name": "womenswedding",
            "categories": {
                "bridesmaiddresses": "Bridesmaid Dresses",
                "motherofthebridedresses": "Mother of the Bride Dresses",
                "weddingdresses": "Wedding Dresses",
                "other": "Other"
            }
        },
        {
            "name": "womensaccessories",
            "categories": {
                "beltsbuckles": "Belts & Buckles",
                "glovesmittens": "Gloves & Mittens",
                "handbagspurseswallets": "Handbags, Purses & Wallets",
                "handkerchiefs": "Handkerchiefs",
                "hatscaps": "Hats & Caps",
                "scarveswraps": "Scarves & Wraps",
                "socks": "Socks",
                "stockingstights": "Stockings & Tights",
                "sunglasseseyewear": "Sunglasses & Eye-wear",
                "umbrellasparasols": "Umbrellas & Parasols"
            }
        },
        {
            "name": "womensweddingaccessories",
            "categories": {
                "garters": "Garters",
                "tiarashairaccessories": "Tiaras & Hair Accessories",
                "veils": "Veils",
                "other": "Other"
            }
        },
        {
            "name": "traveleventsactivities",
            "categories": {
                "accommodation": "Accommodation",
                "activities": "Activities",
                "eventstickets": "Events & Tickets",
                "flights": "Flights",
                "holidaypackages": "Holiday Packages",
                "other": "Other"
            }
        },
        {
            "name": "babychildrenclothing",
            "categories": {
                "babyaccessories": "Baby Accessories",
                "allinones": "All in Ones",
                "dressesskirts": "Dresses & Skirts",
                "footwear": "Footwear",
                "hats": "Hats",
                "jackets": "Jackets",
                "matchingsets": "Matching Sets",
                "pantsoveralls": "Pants & Overalls",
                "pyjamas": "Pyjamas",
                "swimwear": "Swimwear",
                "tops": "Tops",
                "other": "Other"
            }
        },
        {
            "name": "nursery",
            "categories": {
                "cotsbassinets": "Cots & Bassinets",
                "changingtables": "Changing Tables",
                "dressers": "Dressers",
                "glidersrockers": "Gliders & Rockers",
                "toddlerbeds": "Toddler Beds"
            }
        },
        {
            "name": "babygear",
            "categories": {
                "carriers": "Carriers",
                "carseats": "Car Seats",
                "strollers": "Strollers",
                "jumpersbouncers": "Jumpers & Bouncers",
                "nappybags": "Nappy Bags",
                "highchairsbooster": "High Chairs & Booster"
            }
        },
        {
            "name": "beddingdecor",
            "categories": {
                "babytoddlerbedding": "Baby & Toddler Bedding",
                "decor": "Decor",
                "rugs": "Rugs",
                "wall decor": "Wall Decor",
                "kidsteenbedding": "Kids & Teen Bedding",
                "lighting": "Lighting",
                "keepsake": "Keeepsake"
            }
        },
        {
            "name": "babycare",
            "categories": {
                "nappiespottytraining": "Nappies & Potty Training",
                "feeding": "Feeding",
                "dishescupsutensils": "Dishes, Cups & Utensils",
                "bathskincare": "Bath & Skin Care",
                "health": "Health",
                "monitors": "Monitors",
                "safety": "Safety"
            }
        },
        {
            "name": "kidsfurniture",
            "categories": {
                "beanbags": "Bean Bags",
                "beds": "Beds",
                "bunkbeds": "Bunk Beds",
                "nightstands": "Night Stands",
                "playtableschairs": "Play Tables & Chairs",
                "storage": "Storage"
            }
        },
        {
            "name": "babytoysactivities",
            "categories": {
                "activitytoys": "Activity & Toys",
                "buildingblocksets": "Building & Block Sets",
                "pushpulltoys": "Push & Pull Toys",
                "ridingtoys": "Riding Toys",
                "animalsplush": "Animals & Plush",
                "developmentlearning": "Development & Learning",
                "mobiles": "Mobiles",
                "playgymsmats": "Play Gyms & Mats"
            }
        },
        {
            "name": "homeentertainment",
            "categories": {
                "audio": "Audio",
                "accessories": "Accessories",
                "cables": "Cables",
                "dvdblurayplayers": "DVD & Blu-Ray Players",
                "dvrsharddriverecorders": "DVRs, Hard-Drive Recorders",
                "hometheatre": "Home Theatre",
                "other": "Other",
                "projectors": "Projectors",
                "settopboxes": "Set Top Boxes",
                "tvs": "TVs"
            }
        },
        {
            "name": "gaming",
            "categories": {
                "accessories": "Accessories",
                "consoles": "Consoles",
                "games": "Games"
            }
        },
        {
            "name": "cameraaccessories",
            "categories": {
                "batterieschargers": "Batteries & Chargers",
                "lenses": "Lenses",
                "lights": "Lights"
            }
        },
        {
            "name": "action",
            "categories": {
                "action": "Action"
            }
        },
        {
            "name": "compact",
            "categories": {
                "compact": "Compact"
            }
        },
        {
            "name": "dash",
            "categories": {
                "dash": "Dash"
            }
        },
        {
            "name": "dslr",
            "categories": {
                "dslr": "DSLR"
            }
        },
        {
            "name": "film",
            "categories": {
                "film": "Film"
            }
        },
        {
            "name": "video",
            "categories": {
                "video": "Video"
            }
        },
        {
            "name": "bitcoinmining",
            "categories": {
                "bitcoinmining": "Bitcoin Mining"
            }
        },
        {
            "name": "desktoppc",
            "categories": {
                "desktoppc": "Desktop PC"
            }
        },
        {
            "name": "gamessoftware",
            "categories": {
                "gamessoftware": "Games & Software"
            }
        },
        {
            "name": "hardware",
            "categories": {
                "hardware": "Hardware"
            }
        },
        {
            "name": "laptopsnotebooks",
            "categories": {
                "laptopsnotebooks": "Laptops & Notebooks"
            }
        },
        {
            "name": "monitorsscreens",
            "categories": {
                "monitorsscreens": "Monitors & Screens"
            }
        },
        {
            "name": "networking",
            "categories": {
                "networking": "Networking"
            }
        },
        {
            "name": "peripherals",
            "categories": {
                "peripherals": "Peripherals"
            }
        },
        {
            "name": "printersink",
            "categories": {
                "printersink": "Printers & Ink"
            }
        },
        {
            "name": "scanners",
            "categories": {
                "scanners": "Scanners"
            }
        },
        {
            "name": "tablets",
            "categories": {
                "tablets": "Tablets"
            }
        },
        {
            "name": "storage",
            "categories": {
                "cdsdvds": "CDs & DVDs",
                "harddrives": "Hard Drives",
                "other": "Other",
                "sdcards": "SD Cards",
                "usb": "USB"
            }
        },
        {
            "name": "other",
            "categories": {
                "other": "Other"
            }
        },
        {
            "name": "phonesaccessories",
            "categories": {
                "phonesaccessories": "Accessories"
            }
        },
        {
            "name": "mobilephones",
            "categories": {
                "mobilephones": "Mobile Phones"
            }
        },
        {
            "name": "partscomponents",
            "categories": {
                "partscomponents": "Parts & Components"
            }
        },
        {
            "name": "headphones",
            "categories": {
                "headphones": "Headphones"
            }
        },
        {
            "name": "mp3players",
            "categories": {
                "mp3players": "MP3 Players"
            }
        },
        {
            "name": "watches",
            "categories": {
                "watches": "Watches"
            }
        },
        {
            "name": "antiques",
            "categories": {
                "architecturalgarden": "Architectural & Garden",
                "asianantiques": "Asian Antiques",
                "booksmanuscripts": "Books & Manuscripts",
                "decorativearts": "Decorative Arts",
                "ethnographic": "Ethnographic",
                "furniture": "Furniture",
                "linenstextiles": "Linens & Textiles",
                "mapsatlasesglobes": "Maps, Atlases & Globes",
                "periodsstyles": "Periods & Styles",
                "rugscarpets": "Rugs & Carpets",
                "sciencemedicine": "Science & Medicine",
                "sewing": "Sewing",
                "silver": "Silver"
            }
        },
        {
            "name": "arts",
            "categories": {
                "artsuppliesequipment": "Art Supplies & Equipment",
                "carvingssculptures": "Carvings & Sculptures",
                "drawings": "Drawings",
                "hangingsculptures": "Hanging Sculptures",
                "paintings": "Paintings",
                "photographs": "Photographs",
                "printsposters": "Prints & Posters",
                "tattoos": "Tattoos",
                "other": "Other"
            }
        },
        {
            "name": "collectables",
            "categories": {
                "animalcollectables": "Animal Collectables",
                "autographeditems": "Autographed Items",
                "bobbleheadslunchboxespins": "Bobble-heads, Lunch-boxes & Pins",
                "characteranimation": "Character & Animation",
                "chinapotteryglass": "China, Pottery & Glass",
                "coinscurrency": "Coins & Currency",
                "comicbooks": "Comic Books",
                "culturalethniccollectables": "Cultural & Ethnic Collectables",
                "currentvintageadvertising": "Current & Vintage Advertising",
                "decorative": "Decorative",
                "dollsbears": "Dolls & Bears",
                "figurinesminiatures": "Figurines & Miniatures",
                "historywar": "History & War",
                "holidayseasonal": "Holiday & Seasonal",
                "kitchenhome": "Kitchen & Home",
                "mediapaperproducts": "Media & Paper Products",
                "mythicalfantasycollectables": "Mythical & Fantasy Collectables",
                "rocksfossilsminerals": "Rocks, Fossils & Minerals",
                "stampspostcards": "Stamps & Postcards",
                "toysgames": "Toys & Games",
                "tradingcards": "Trading Cards",
                "transportation": "Transportation",
                "travelsouvenirsmemorabilia": "Travel Souvenirs & Memorabilia",
                "trophiesplaquesawards": "Trophies, Plaques & Awards",
                "vendingmachinesmoneysavers": "Vending Machines & Money Savers",
                "writinginstruments": "Writing Instruments"
            }
        },
        {
            "name": "entertainmentmemorabilia",
            "categories": {
                "movie": "Movie",
                "music": "Music",
                "originalautographs": "Original Autographs",
                "television": "Television",
                "theatre": "Theatre"
            }
        },
        {
            "name": "otheratscollectables",
            "categories": {
                "otheratscollectables": "Other Arts & Collectables"
            }
        },
        {
            "name": "bedbath",
            "categories": {
                "bathaccessories": "Bath Accessories",
                "bathlinen": "Bath Linen",
                "beddingessentials": "Bedding Essentials",
                "sheetsets": "Sheet Sets",
                "duvetsquiltsblanketscomforters": "Duvets, Quilts, Blankets & Comforters",
                "closetlaundryorganisation": "Closet & Laundry Organisation"
            }
        },
        {
            "name": "decor",
            "categories": {
                "lighting": "Lighting",
                "cushionsthrows": "Cushions & Throws",
                "walldecor": "Wall Decor",
                "rugs": "Rugs",
                "mirrors": "Mirrors",
                "vasesvessels": "Vases & Vessels",
                "clocks": "Clocks",
                "holidayseasonal": "Holiday & Seasonal"
            }
        },
        {
            "name": "furniture",
            "categories": {
                "accenttables": "Accent Tables",
                "bedroom": "Bedroom",
                "dining": "Dining",
                "sofaslounge": "Sofas & Lounge",
                "benchesottomans": "Benches & Ottomans",
                "homeoffice": "Home Office"
            }
        },
        {
            "name": "kitchendining",
            "categories": {
                "barware": "Bar Ware",
                "cookingbaking": "Cooking & Baking",
                "kitchenlinen": "Kitchen Linen",
                "kitchenutensils": "Kitchen Utensils",
                "storageorganisation": "Storage & Organisation"
            }
        },
        {
            "name": "luggage",
            "categories": {
                "luggagesets": "Luggage Sets",
                "suitcases": "Suitcases",
                "travelaccessories": "Travel Accessories",
                "travelbags": "Travel Bags",
                "other": "Other"
            }
        },
        {
            "name": "outdoor",
            "categories": {
                "outdoorfurniture": "Outdoor Furniture",
                "outdoorentertaining": "Outdoor Entertaining",
                "outdoordecor": "Outdoor Decor",
                "firepitsfireplaces": "Fire Pits & Fire Places",
                "gardening": "Gardening"
            }
        },
        {
            "name": "pets",
            "categories": {
                "catsupplies": "Cat Supplies",
                "dogsupplies": "Dog Supplies",
                "otherpetsupplies": "Other Pet Supplies"
            }
        },
        {
            "name": "appliances",
            "categories": {
                "coffee": "Coffee",
                "cooking": "Cooking",
                "foodprep": "Food Prep",
                "fridges": "Fridges",
                "juicers": "Juicers",
                "kettles": "Kettles",
                "microwaves": "Microwaves",
                "scales": "Scales",
                "toastersgrills": "Toasters & Grills",
                "airconditioners": "Air-conditioners",
                "airhumidifiers": "Air-humidifiers",
                "airpurifiers": "Air-purifiers",
                "heating": "Heating",
                "carpetsteamcleaners": "Carpet & Steam Cleaners",
                "dishwashers": "Dishwashers",
                "washersdryers": "Washers & Dryers",
                "vacuumcleaners": "Vacuum Cleaners",
                "other": "Other"
            }
        },
        {
            "name": "food",
            "categories": {
                "bakery": "Bakery",
                "catering": "Catering",
                "confectionary": "Confectionary",
                "deli": "Deli",
                "freshproduce": "Fresh Produce",
                "grocery": "Grocery",
                "internationalfood": "International Food",
                "meatseafood": "Meat & Seafood",
                "other": "Other"
            }
        },
        {
            "name": "wine",
            "categories": {
                "red": "Red",
                "sparkling": "Sparkling",
                "white": "White",
                "other": "Other"
            }
        }];

    let subscriptionPlans = [
        {
            "planId": "qqkg",
            "group": "Business Plus",
            "planNo": 2,
            "name": "businessplus",
            "displayName": "Business Plus",
            "tagline": "Become verified and accept BTC Direct payments",
            "description": "All Business features plus...",
            "percentage": 2,
            "features": [
                'Accept BTC Direct payments',
                'Verification Enabled',
                'Convert BTC/AUD via BitPOS*'
            ]
        },
        {
            "planId": "hrdb",
            "group": "Business",
            "planNo": 1,
            "name": "business",
            "displayName": "Business",
            "tagline": "Start today for less - accept moderated payments",
            "description": "Access to the following features",
            "percentage": 1,
            "features": [
                'Unlimited Listings',
                'Accept moderated BTC payments',
                'Your own store front',
                'Simple image editing tools',
                'Bring your own BTC wallet',
                'Featured Merchant Enabled',
                'No listing fees, no subscription fees',
                'Access support & knowledge base'
            ]
        }];

    let siteDefaults = {
        "bannerStyle": {
            "backgroundImage": "",
            "backgroundColor": "",
            "transition": true
        },
        "typewriterEnabled": true,
        "typewriterText": [
            {
                "text": "Time for a change - trajans.market",
                "wordsAndIcons": [
                    {
                        "icon": "time",
                        "words": [
                            0
                        ]
                    },
                    {
                        "icon": "refresh",
                        "words": [
                            3
                        ]
                    }
                ]
            }
        ]
    };

    categories.forEach(function (doc) {
        saveCategory(doc);
        getCategoryCounts(doc);
    });

    primaryCategories.forEach(function (doc) {
        savePrimaryCategory(doc);
    });

    secondaryCategories.forEach(function (doc) {
        saveSecondaryCategory(doc);
    });

    tertiarycategories.forEach(function (doc) {
        saveTertiaryCategory(doc);
    });

    subscriptionPlans.forEach(function (plan) {
        saveSubscriptionPlans(plan);
    });

    saveSiteDefaults(siteDefaults);
}

function saveCategory(doc) {
    let Category = mongoose.model('Category');

    Category.remove({}, function () {
        let cat = new Category();

        cat.title = doc.title;
        cat.alias = doc.alias;
        cat.listingCount = 0;
        cat.end = doc.end;
        cat.save(doc, function (err, saved) {
            console.log("saved");
        });
    });
}

function savePrimaryCategory(doc) {
    let PrimaryCategory = mongoose.model('PrimaryCategory');

    PrimaryCategory.remove({}, function () {
        let pri = new PrimaryCategory();

        pri.categories = doc.categories;
        pri.name = doc.name;
        pri.alias = doc.alias;
        pri.end = doc.end;
        pri.save(doc, function (err, saved) {
            console.log("saved");
        });
    });
}

function saveSecondaryCategory(doc) {
    let SecondaryCategory = mongoose.model('SecondaryCategory');

    SecondaryCategory.remove(function () {
        let sec = new SecondaryCategory();

        sec.categories = doc.categories;
        sec.name = doc.name;
        sec.alias = doc.alias;
        sec.end = doc.end;
        sec.save(doc, function (err, saved) {
            console.log("saved");
        });
    });
}

function saveTertiaryCategory(doc) {
    let TertiaryCategory = mongoose.model('TertiaryCategory');

    TertiaryCategory.remove(function () {
        let ter = new TertiaryCategory();

        ter.categories = doc.categories;
        ter.name = doc.name;
        ter.save(doc, function (err, saved) {
            console.log("saved");
        });
    });
}

function saveSubscriptionPlans(plan) {
    let SubscriptionPlan = mongoose.model('SubscriptionPlan');

    SubscriptionPlan.find(function (err, plans) {
        if (!plans.length) {
            let sub = new SubscriptionPlan();

            sub.planId = plan.planId;
            sub.group = plan.group;
            sub.planNo = plan.planNo;
            sub.name = plan.name;
            sub.displayName = plan.displayName;
            sub.tagline = plan.tagline;
            sub.description = plan.description;
            sub.percentage = plan.percentage;
            sub.features = plan.features;
            sub.save(plan, function (err, saved) {
                console.log("saved");
            });
        }
    });
}

function saveSiteDefaults(defaults) {
    let SiteDefault = mongoose.model('SiteDefault');

    SiteDefault.find(function (err, defaults) {
        if (!defaults.length) {
            let sited = new SiteDefault();

            sited.bannerStyle = defaults.bannerStyle;
            sited.typewriterText = defaults.typewriterText;
            sited.save(sited, function (err, saved) {
                console.log("saved");
            });
        }
    });
}

function getCategoryCounts(cat) {
    let Listing = mongoose.model('Listing');
    let Category = mongoose.model('Category');

    Listing.count({
            category: cat.alias,
            listingActive: true,
            quantityAvailable: {$gt: 0}
        },
        function (err, count) {
            Category.findOneAndUpdate(cat, {listingCount: count}, function (err, category) {
            });
        });
}
