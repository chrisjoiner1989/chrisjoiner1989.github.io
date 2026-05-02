import type { SermonTemplate } from '@/types'

export const SERMON_TEMPLATES: SermonTemplate[] = [
  {
    id: 'expository',
    name: 'Expository (Verse-by-Verse)',
    description: 'Walk through a passage systematically, verse by verse',
    sections: [
      { heading: 'Introduction', scripture: '', notes: 'Hook the audience. Introduce the passage and its context.' },
      { heading: 'Historical Context', scripture: '', notes: 'Background: author, audience, time period, cultural setting.' },
      { heading: 'Passage Section 1', scripture: '', notes: 'Observe, interpret, and apply verses.' },
      { heading: 'Passage Section 2', scripture: '', notes: 'Observe, interpret, and apply verses.' },
      { heading: 'Passage Section 3', scripture: '', notes: 'Observe, interpret, and apply verses.' },
      { heading: 'Application', scripture: '', notes: 'How does this passage apply to us today? Practical steps.' },
      { heading: 'Conclusion', scripture: '', notes: 'Summarize the main truth. Call to action. Close in prayer.' },
    ],
  },
  {
    id: 'topical',
    name: 'Topical (Theme-Based)',
    description: 'Explore a theme or topic using multiple scriptures',
    sections: [
      { heading: 'Introduction', scripture: '', notes: 'Introduce the topic and why it matters.' },
      { heading: 'Biblical Foundation', scripture: '', notes: 'The key scriptures supporting this topic.' },
      { heading: 'Truth 1', scripture: '', notes: 'First main point about the topic.' },
      { heading: 'Truth 2', scripture: '', notes: 'Second main point about the topic.' },
      { heading: 'Truth 3', scripture: '', notes: 'Third main point about the topic.' },
      { heading: 'Application', scripture: '', notes: 'Practical ways to apply these truths.' },
      { heading: 'Conclusion', scripture: '', notes: 'Bring it all together. Final challenge.' },
    ],
  },
  {
    id: 'narrative',
    name: 'Narrative (Story-Based)',
    description: 'Tell a biblical story with application for today',
    sections: [
      { heading: 'Setting the Scene', scripture: '', notes: 'Paint the picture. Who, what, where, when.' },
      { heading: 'The Initial Situation', scripture: '', notes: 'What was happening before the key event?' },
      { heading: 'The Conflict', scripture: '', notes: 'The tension, problem, or challenge in the story.' },
      { heading: 'The Turning Point', scripture: '', notes: "God's intervention or the key moment of change." },
      { heading: 'The Resolution', scripture: '', notes: 'How did God resolve the situation? What was the outcome?' },
      { heading: 'Personal Application', scripture: '', notes: 'How does this story speak to our lives today?' },
      { heading: 'Conclusion', scripture: '', notes: 'The timeless truth from this story.' },
    ],
  },
  {
    id: 'three-point',
    name: 'Classic Three-Point',
    description: 'Traditional three-point sermon structure',
    sections: [
      { heading: 'Introduction', scripture: '', notes: 'Open with a hook. State your main theme.' },
      { heading: 'Point 1', scripture: '', notes: 'First main point with scripture support and illustration.' },
      { heading: 'Point 2', scripture: '', notes: 'Second main point with scripture support and illustration.' },
      { heading: 'Point 3', scripture: '', notes: 'Third main point with scripture support and illustration.' },
      { heading: 'Conclusion', scripture: '', notes: 'Summarize all three points. Issue the call to action.' },
    ],
  },
]
