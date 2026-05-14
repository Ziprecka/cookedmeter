export const categories = [
  "General",
  "Money",
  "Dating",
  "School",
  "Career",
  "Business",
  "Social",
  "Fitness",
  "Family",
] as const;

export const intensities = ["Gentle", "Honest", "Brutal", "Unhinged"] as const;

export const examples = [
  "I spent $200 on ads and got one booking.",
  "I have an exam tomorrow and just opened the textbook.",
  "I texted my ex at 2 AM.",
  "I quit my job with no backup plan.",
  "I bought a project car from Facebook Marketplace.",
  "I told my boss 'sounds good' but have no idea what they meant.",
  "I have no money and need to move out.",
  "I agreed to host the party and own four paper plates.",
  "I launched a business and forgot to make an offer.",
  "I told my trainer I meal prepped but it was just cereal in a container.",
  "I said I could fix the sink after watching one video.",
  "I booked a flight for the wrong month and just noticed.",
] as const;

export const homepagePlaceholders = [
  "I have an exam tomorrow and just opened the textbook.",
  "I texted my ex at 2 AM.",
  "I have no money and need to move out.",
  "I spent $200 and got one sale.",
  "I bought a project car with no tools.",
] as const;

export const exampleChips = [
  {
    label: "Exam tomorrow",
    value: "I have an exam tomorrow and just opened the textbook.",
  },
  {
    label: "Texted my ex",
    value: "I texted my ex at 2 AM.",
  },
  {
    label: "Bad money move",
    value: "I spent $200 and got one sale.",
  },
] as const;

export const loadingMessages = [
  "Preheating...",
  "Checking smoke levels...",
  "Consulting the group chat...",
  "Verdict loading...",
] as const;

export const futureModes = [
  "Classic Cooked",
  "Brutal But Useful",
  "Meme Court",
  "Financially Cooked",
  "Relationship Cooked",
  "Student Cooked",
  "Career Cooked",
  "Business Cooked",
  "Villain Arc",
  "Therapist Who Gave Up",
  "Group Chat Verdict",
] as const;

export const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "5 free cooked checks, watermarked cards",
  },
  {
    name: "Cooked Refill",
    price: "$2.99",
    description: "10 more cooked checks",
  },
  {
    name: "Extra Crispy",
    price: "$4.99",
    description: "25 more checks and no-watermark cards",
  },
  {
    name: "Unlimited",
    price: "$4.99/mo",
    description: "Unlimited checks, no watermark, HD cards",
  },
] as const;
