# Unit economics: TransitWake

Every number below comes from the input file. Nothing is looked up or guessed.

## One subscriber-month

| line | per subscriber-month |
| --- | ---: |
| Price | $26.00 |
| App Store / Play Store fee (15% small developer) | -$3.90 |
| Map tile CDN bandwidth & server caching | -$0.80 |
| WhatsApp / notification relay webhook | -$0.50 |
| **Contribution** (what each subscriber-month leaves to pay the fixed costs) | **$20.80** (80%) |

## The margin that matters

Fixed costs: $4,500 a month (High-availability Nominatim & tile proxy VPS $3,000, Domain, SSL, crash analytics & monitoring $1,500).

- **Break-even: 8 subscriber-months a day.** Below that you lose money every month.
- **Profit margin at your plan** (350 a day): **78%** of every sale, after every cost.
- Capacity: 10000 a day.

## Year 1, month by month

| month | subscriber-months a day | revenue | profit | cumulative (after $12,000 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 25 | $19,500 | $11,100 | -$900 |
| 2 | 50 | $39,000 | $26,700 | $25,800 |
| 3 | 85 | $66,300 | $48,540 | $74,340 |
| 4 | 120 | $93,600 | $70,380 | $144,720 |
| 5 | 160 | $124,800 | $95,340 | $240,060 |
| 6 | 200 | $156,000 | $120,300 | $360,360 |
| 7 | 240 | $187,200 | $145,260 | $505,620 |
| 8 | 275 | $214,500 | $167,100 | $672,720 |
| 9 | 305 | $237,900 | $185,820 | $858,540 |
| 10 | 330 | $257,400 | $201,420 | $1,059,960 |
| 11 | 345 | $269,100 | $210,780 | $1,270,740 |
| 12 | 350 | $273,000 | $213,900 | $1,484,640 |

- **Year 1 operating profit: $1,496,640** on $1,938,300 of revenue.
- After the $12,000 startup spend: $1,484,640.
- Startup money earned back: month 2.
- Cash you need before it pays for itself: **$12,000**.

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 78% | 8 | $1,496,640 |
| Price -10% | 76% | 9 | $1,302,810 |
| Volume -20% | 78% | 8 | $1,186,512 |
| Unit costs +15% | 75% | 8 | $1,438,491 |

No red flags in these numbers. They are only as good as the inputs: check every cost against a real quote.
