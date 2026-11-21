// Chapter checkpoints: one closing loop per chapter that had only three lessons.
// Each one brings the chapter's ideas together in a single real-life scenario: scenario → two decisions → takeaway.
const cp = (id, title, scenario, q1, q2, k) => ({
  id, title,
  screens: [
    { type: 'text', title, text: scenario },
    { type: 'question', title: `${title} · Decision 1`, ...q1 },
    { type: 'question', title: `${title} · Decision 2`, ...q2 },
    { type: 'takeaway', title: `${title} - Key Takeaway`, k },
  ],
});

export const CHECKPOINTS = [
  cp('bl-goals-checkpoint', 'Checkpoint: Maya’s Laptop Plan',
    ['Time to put this chapter together.', 'Maya wants a $1,200 laptop for school. Right now she has a vague plan: “save up for a laptop someday.”', 'She gets paid $600 every two weeks and usually saves whatever is left over at the end of the month, which is often nothing.'],
    { q: 'Which version of Maya’s goal is most likely to work?', choices: ['Save for a laptop someday', 'Save as much as possible', '*Save $1,200 for a laptop by next August', 'Buy the laptop now and figure it out later'], e: 'A goal with a number and a date tells Maya exactly how much to set aside and when she is on track.' },
    { q: 'Maya needs about $50 per paycheck. When should that money move to savings?', choices: ['At the end of the month, if there is any left', '*On payday, before she spends anything', 'Only when she gets a bonus', 'After she pays for fun plans'], e: 'Paying yourself first turns the goal into a bill you never forget, instead of a leftover that never shows up.' },
    'A clear goal plus an automatic payday transfer beats willpower. Name it, date it, and pay it first.'),

  cp('bl-debt-checkpoint', 'Checkpoint: Jordan’s Two Debts',
    ['Let’s bring interest and debt together.', 'Jordan has a $9,000 car loan at 7% that gets them to work, and a $1,500 credit card balance at 24% from a trip last summer.', 'Jordan just found an extra $100 a month in their budget.'],
    { q: 'Which of Jordan’s debts is costing the most each month for every dollar owed?', choices: ['The car loan, because the balance is bigger', '*The credit card, because 24% is far higher than 7%', 'They cost the same', 'Neither, as long as minimums are paid'], e: 'Interest is charged as a rate. A dollar on a 24% card costs over three times what a dollar on a 7% loan costs.' },
    { q: 'Where should Jordan’s extra $100 go first?', choices: ['Split it evenly across both', 'Into the car loan, to own the car sooner', '*Toward the credit card, after paying both minimums', 'Nowhere, keep it in checking'], e: 'Pay every minimum, then send extra cash to the highest rate. Once the card is gone, roll that payment into the car loan.' },
    'Know the rate on every debt. Keep minimums on time, then attack the most expensive dollar first.'),

  cp('bl-home-checkpoint', 'Checkpoint: Two Houses, One Budget',
    ['Time to think like a buyer.', 'You are choosing between two $250,000 homes. Home A is in a great school district with a short commute, but it has an older kitchen. Home B has a brand new kitchen but adds 50 minutes of driving each day.'],
    { q: 'Using the 1-2% rule, about how much should you budget each year for maintenance on a $250,000 home?', choices: ['$250 to $500', '*$2,500 to $5,000', '$25,000', 'Nothing for the first five years'], e: '1% of $250,000 is $2,500 and 2% is $5,000. Repairs show up whether you planned for them or not.' },
    { q: 'Based on “Location > Structure > Style,” which home is the stronger long-term pick?', choices: ['*Home A, because location can’t be changed later', 'Home B, because kitchens are expensive', 'Neither, wait for a perfect home', 'Whichever has the bigger yard'], e: 'You can update a kitchen. You can’t move a house closer to work or a better school.' },
    'Budget for the whole cost of owning, and pay for the things you can’t change later.'),

  cp('bl-home-budget-checkpoint', 'Checkpoint: What Can Sam Afford?',
    ['Let’s run the numbers like a lender would.', 'Sam earns $6,000 a month before taxes. Sam already pays $600 a month toward a car loan and student loans.'],
    { q: 'Using the 28% guideline, what is the most Sam should spend on housing each month?', choices: ['$1,200', '*$1,680', '$2,160', '$3,000'], e: '28% of $6,000 is $1,680, covering mortgage, property taxes and insurance.' },
    { q: 'All debt should stay under 36% ($2,160). With $600 of other debt, what housing payment keeps Sam under that line?', choices: ['$1,680', '*$1,560 or less', '$2,160', '$2,760'], e: '$2,160 minus $600 leaves $1,560. The tighter of the two limits is the one that counts.' },
    'Check both limits and use the lower one. Get pre-approved so your number is real before you shop.'),

  cp('bl-closing-checkpoint', 'Checkpoint: Closing Week Curveballs',
    ['Your offer was accepted at $300,000. Two surprises show up during closing week.', 'First, the appraisal comes back at $290,000. Then an email arrives that looks like it’s from your title company, with “updated” wiring instructions for your down payment.'],
    { q: 'The home appraised $10,000 below your offer. What is a smart first move?', choices: ['Cancel your loan application', '*Use the appraisal to renegotiate the price or the gap with the seller', 'Ignore it, the bank will cover the difference', 'Wire the extra money right away'], e: 'Lenders lend based on the appraised value. A low appraisal is a reason to negotiate, and your contingencies give you room to do it.' },
    { q: 'What should you do about the new wiring instructions?', choices: ['Follow them, the email looks official', 'Reply to the email to confirm', '*Call the title company at a number you already know is real', 'Wire half now and half later'], e: 'Wire fraud often targets closing week. Always verify instructions by phone using a number you found yourself.' },
    'Contingencies protect your money and your negotiating power. Never wire a dollar without verifying by phone.'),

  cp('bl-benefits-checkpoint', 'Checkpoint: Reading Your Offer Letter',
    ['Your first full-time offer is here: $50,000 a year, with a 401(k) match of 100% up to 4% of pay.', 'You also have to pick a health plan. Plan A costs $100 a month with a $6,000 out-of-pocket max. Plan B costs $200 a month with a $2,000 out-of-pocket max.'],
    { q: 'How much do you need to contribute to get the full match, and what is the match worth?', choices: ['1%, worth $500', '*4% of pay, worth $2,000 a year', '10%, worth $5,000', 'Nothing, the match is automatic'], e: '4% of $50,000 is $2,000. Put in 4% and your employer adds another $2,000.' },
    { q: 'In a worst-case year, which plan costs less in total?', choices: ['Plan A, because the premium is lower', '*Plan B: $2,400 in premiums plus $2,000 max is $4,400', 'They cost exactly the same', 'Impossible to tell'], e: 'Plan A worst case: $1,200 + $6,000 = $7,200. Plan B worst case: $2,400 + $2,000 = $4,400.' },
    'Grab the full match, then compare health plans by a full year of premiums plus the out-of-pocket max.'),

  cp('bl-loans-checkpoint', 'Checkpoint: Building a Borrowing Plan',
    ['Your aid letter shows a $4,000 gap for the year.', 'You are offered $3,500 in Federal Direct Subsidized loans, $2,000 in Unsubsidized loans, and a $5,000 private loan.'],
    { q: 'What is the smartest way to cover the $4,000 gap?', choices: ['Take the $5,000 private loan', 'Accept everything, just in case', '*Take the $3,500 Subsidized loan plus $500 Unsubsidized', 'Take $4,000 Unsubsidized'], e: 'Subsidized loans don’t build interest while you’re in school. Borrow only the gap, and keep federal protections.' },
    { q: 'Repayment is starting. What simple step can lower your federal loan rate?', choices: ['Skip the first payment', '*Turn on autopay for the 0.25% rate cut', 'Switch every loan to a private lender', 'Pay only when you remember'], e: 'Federal servicers usually cut 0.25% off your rate for autopay, and you never miss a due date.' },
    'Borrow the gap and no more, cheapest loans first. Then automate repayment.'),

  cp('bl-renting-checkpoint', 'Checkpoint: Signing Your First Lease',
    ['You found a two-bedroom for $1,100 a month with a roommate. The landlord wants first month’s rent plus a deposit equal to one month.', 'The lease is “joint and several,” and it requires 60 days’ notice before you move out.'],
    { q: 'Before setup costs, how much cash do you need on signing day for your own share if you split everything 50/50?', choices: ['$550', '*$1,100 (your half of $2,200)', '$2,200', '$3,300'], e: 'First month ($1,100) plus deposit ($1,100) is $2,200 total, so $1,100 each, before utilities and furniture.' },
    { q: 'Your roommate moves out in month six and stops paying. Under a joint and several lease, who owes the full rent?', choices: ['Only your roommate', 'Nobody until the lease ends', '*You could be on the hook for the full $1,100', 'The landlord absorbs it'], e: '“Joint and several” means every signer is responsible for the whole rent, not just their share.' },
    'Save for move-in costs, read who is responsible for what, and document everything on day one.'),

  cp('bl-payoff-checkpoint', 'Checkpoint: Riley’s Payoff Plan',
    ['Riley has two cards: Card A has a $400 balance at 18% APR. Card B has a $2,000 balance at 26% APR.', 'Riley pays both minimums and has $150 extra each month. Riley also wants to buy concert tickets from a stranger online.'],
    { q: 'Using the Avalanche method, where does Riley’s extra $150 go?', choices: ['*Card B, the highest APR', 'Card A, the smallest balance', 'Split evenly', 'Into a new Pay-in-4 plan'], e: 'Avalanche targets the highest rate first, which saves the most interest. Snowball would pick Card A for a quick win.' },
    { q: 'The ticket seller asks Riley to pay by Zelle. What is the safer move?', choices: ['Send it by Zelle, it’s faster', '*Pay through a platform with buyer protection or a credit card', 'Send half now', 'Use a gift card'], e: 'Peer-to-peer apps work like cash. A credit card or protected checkout lets you dispute a charge if the tickets never come.' },
    'Pick a payoff method and stick to it. Pay strangers only in ways you can dispute.'),

  cp('bl-portfolio-checkpoint', 'Checkpoint: Your First $200 a Month',
    ['You now have $200 extra each month. You have no emergency cushion yet, and your employer offers a 401(k) match you are not using.', 'You are also comparing two funds: one charges 0.05% a year, the other charges 1%.'],
    { q: 'Following the next-dollar order, where should your first extra dollars go?', choices: ['A high-fee active fund', '*A starter emergency cushion in high-yield savings', 'A single hot stock', 'Paying off your lowest-rate loan'], e: 'A starter cushion comes first, then the full employer match. Each step protects the next.' },
    { q: 'A few months in, the market drops 15%. What does a long-term investor usually do?', choices: ['Sell everything to stop the loss', '*Keep investing on schedule in a low-fee index fund', 'Switch to the 1% fund', 'Stop contributing for a year'], e: 'Drops are normal. Steady buying in low-fee funds means your monthly amount buys more shares while prices are low. Past recoveries don’t guarantee future ones.' },
    'Cushion first, match second, low fees always, and stay the course when markets wobble.'),
];