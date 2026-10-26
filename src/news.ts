// Playful, fixed "AI news" picks keyed by rising sign. Hand-written, offline.
// The headlines are made up for fun and have no real article URL, so each story's
// "Read more" link goes to a Google News search for its headline (see storyUrl).
// `source` is only the outlet the story is styled after; it is not linked.

export type Source = { name: string }
export type Story = { text: string; source: Source }

export function storyUrl(story: Story): string {
  return `https://news.google.com/search?q=${encodeURIComponent(`${story.text} AI news`)}`
}

const SOURCES = {
  techcrunch: { name: "TechCrunch AI" },
  mit: { name: "MIT Technology Review" },
  verge: { name: "The Verge AI" },
  ars: { name: "Ars Technica AI" },
  wired: { name: "WIRED AI" },
  spectrum: { name: "IEEE Spectrum AI" },
  robotics: { name: "IEEE Spectrum Robotics" },
  mitnews: { name: "MIT News AI" },
  guardian: { name: "The Guardian AI" },
  bbc: { name: "BBC AI" },
  nature: { name: "Nature Machine Learning" },
} satisfies Record<string, Source>

const s = SOURCES

export const AI_NEWS: Record<string, readonly [Story, Story, Story]> = {
  Aries: [
    { text: "New AI tool drafts your \"I will do it right now\" emails in 0.3 seconds.", source: s.techcrunch },
    { text: "Tip: Ask your assistant to split a big goal into three tiny first steps.", source: s.mit },
    { text: "Fitness bot reports that rushing in beats overthinking, mostly.", source: s.wired },
  ],
  Taurus: [
    { text: "Meal-planning AI finally learns that dessert is a food group.", source: s.wired },
    { text: "Tip: Let an assistant compare prices first, then sleep on the purchase.", source: s.verge },
    { text: "Smart speaker adds a \"cozy mode\" with slower playlists.", source: s.ars },
  ],
  Gemini: [
    { text: "Chatbot hosts a panel with itself and still interrupts.", source: s.ars },
    { text: "Tip: Have AI squeeze your 14 open tabs into three bullet points.", source: s.verge },
    { text: "New translator app turns your group chat into five languages at once.", source: s.techcrunch },
  ],
  Cancer: [
    { text: "Photo AI sorts your family pictures into \"cute\" and \"extra cute.\"", source: s.verge },
    { text: "Tip: Ask an assistant to draft a warm check-in note to someone you miss.", source: s.guardian },
    { text: "Home robot learns to make tea exactly the way you like it.", source: s.robotics },
  ],
  Leo: [
    { text: "AI stylist declares your outfit \"main character energy.\"", source: s.wired },
    { text: "Tip: Ask an assistant to punch up your presentation opener.", source: s.techcrunch },
    { text: "Video tool adds a standing ovation to every home movie.", source: s.verge },
  ],
  Virgo: [
    { text: "New AI spreadsheet fixes a typo you had not noticed yet.", source: s.techcrunch },
    { text: "Tip: Let an assistant turn messy notes into a clean checklist.", source: s.verge },
    { text: "Proofreading bots rejoice over a perfectly placed semicolon.", source: s.ars },
  ],
  Libra: [
    { text: "AI referee settles the group-chat \"where to eat\" debate in seconds.", source: s.guardian },
    { text: "Tip: Ask an assistant for pros and cons, then pick without regret.", source: s.mit },
    { text: "Design app rebalances your living room until everything matches.", source: s.wired },
  ],
  Scorpio: [
    { text: "Mystery-solving AI cracks the case of the missing sock.", source: s.nature },
    { text: "Tip: Use an assistant to dig deep, then double-check the sources.", source: s.bbc },
    { text: "New privacy setting hides your secrets even from your toaster.", source: s.ars },
  ],
  Sagittarius: [
    { text: "Travel AI plans a spontaneous trip with a \"surprise me\" button.", source: s.verge },
    { text: "Tip: Ask an assistant for three weekend adventures near home.", source: s.guardian },
    { text: "Language app lets you order lunch in a country you have not visited yet.", source: s.techcrunch },
  ],
  Capricorn: [
    { text: "AI planner schedules your goals, your goals' goals, and a nap.", source: s.techcrunch },
    { text: "Tip: Have an assistant turn your five-year plan into this week's to-do list.", source: s.mit },
    { text: "Smart calendar politely declines meetings that could be emails.", source: s.verge },
  ],
  Aquarius: [
    { text: "Inventor teaches an AI to hum a song that does not exist yet.", source: s.mitnews },
    { text: "Tip: Ask an assistant for a weird idea, then make it weirder.", source: s.wired },
    { text: "Robot club votes to meet on the moon; membership soars.", source: s.robotics },
  ],
  Pisces: [
    { text: "Dream-journal AI turns your midnight thoughts into tidy notes.", source: s.verge },
    { text: "AI art tool paints your mood as a watercolor sunset.", source: s.wired },
    { text: "Tip: Let an assistant draft a kind message, then add your own words.", source: s.guardian },
  ],
}
