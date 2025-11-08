/**
 * Bible Topics
 * Pre-built collections of scripture references organized by theme
 */

class BibleTopics {
  constructor() {
    this.topics = this.initializeTopics();
  }

  /**
   * Initialize all topic collections
   */
  initializeTopics() {
    return {
      salvation: {
        id: 'salvation',
        name: 'Salvation',
        description: 'God\'s gift of eternal life through Jesus Christ',
        verses: [
          'John 3:16',
          'Romans 10:9-10',
          'Ephesians 2:8-9',
          'Acts 4:12',
          'Romans 6:23',
          'Titus 3:5',
          '2 Corinthians 5:17',
          'John 14:6'
        ]
      },

      faith: {
        id: 'faith',
        name: 'Faith',
        description: 'Trusting in God and His promises',
        verses: [
          'Hebrews 11:1',
          'Romans 10:17',
          'James 2:17',
          'Mark 11:22-24',
          'Ephesians 2:8',
          'Hebrews 11:6',
          '2 Corinthians 5:7',
          'Matthew 17:20'
        ]
      },

      love: {
        id: 'love',
        name: 'Love',
        description: 'God\'s love for us and our love for others',
        verses: [
          '1 Corinthians 13:4-8',
          'John 13:34-35',
          '1 John 4:7-8',
          '1 John 4:19',
          'Romans 5:8',
          'John 15:13',
          'Matthew 22:37-39',
          '1 Peter 4:8'
        ]
      },

      hope: {
        id: 'hope',
        name: 'Hope',
        description: 'Confident expectation in God\'s promises',
        verses: [
          'Romans 15:13',
          'Jeremiah 29:11',
          'Hebrews 6:19',
          'Psalm 42:5',
          'Romans 5:5',
          '1 Peter 1:3',
          'Proverbs 23:18',
          'Lamentations 3:22-23'
        ]
      },

      grace: {
        id: 'grace',
        name: 'Grace',
        description: 'God\'s unmerited favor and blessing',
        verses: [
          'Ephesians 2:8-9',
          '2 Corinthians 12:9',
          'Titus 2:11',
          'Romans 3:23-24',
          'James 4:6',
          'Hebrews 4:16',
          'John 1:16',
          '2 Peter 3:18'
        ]
      },

      peace: {
        id: 'peace',
        name: 'Peace',
        description: 'The peace that comes from God',
        verses: [
          'Philippians 4:6-7',
          'John 14:27',
          'Isaiah 26:3',
          'Romans 5:1',
          'Colossians 3:15',
          'John 16:33',
          'Psalm 29:11',
          '2 Thessalonians 3:16'
        ]
      },

      joy: {
        id: 'joy',
        name: 'Joy',
        description: 'True happiness found in Christ',
        verses: [
          'Nehemiah 8:10',
          'Psalm 16:11',
          'John 15:11',
          'Romans 15:13',
          'Galatians 5:22',
          'Philippians 4:4',
          '1 Peter 1:8',
          'James 1:2'
        ]
      },

      prayer: {
        id: 'prayer',
        name: 'Prayer',
        description: 'Communicating with God',
        verses: [
          'Philippians 4:6',
          '1 Thessalonians 5:17',
          'Matthew 6:6',
          'James 5:16',
          '1 John 5:14',
          'Matthew 7:7',
          'Luke 18:1',
          'Psalm 145:18'
        ]
      },

      forgiveness: {
        id: 'forgiveness',
        name: 'Forgiveness',
        description: 'God\'s forgiveness and forgiving others',
        verses: [
          '1 John 1:9',
          'Ephesians 4:32',
          'Colossians 3:13',
          'Matthew 6:14-15',
          'Psalm 103:12',
          'Acts 3:19',
          'Isaiah 43:25',
          'Luke 6:37'
        ]
      },

      strength: {
        id: 'strength',
        name: 'Strength',
        description: 'Finding strength in God',
        verses: [
          'Philippians 4:13',
          'Isaiah 40:31',
          '2 Corinthians 12:9-10',
          'Psalm 46:1',
          'Nehemiah 8:10',
          'Exodus 15:2',
          'Psalm 28:7',
          'Ephesians 6:10'
        ]
      },

      wisdom: {
        id: 'wisdom',
        name: 'Wisdom',
        description: 'Godly wisdom and discernment',
        verses: [
          'James 1:5',
          'Proverbs 3:5-6',
          'Proverbs 2:6',
          'Colossians 3:16',
          'Psalm 111:10',
          '1 Corinthians 2:14',
          'Proverbs 4:7',
          'James 3:17'
        ]
      },

      courage: {
        id: 'courage',
        name: 'Courage',
        description: 'Being brave and strong in the Lord',
        verses: [
          'Joshua 1:9',
          'Psalm 27:1',
          'Deuteronomy 31:6',
          '2 Timothy 1:7',
          'Isaiah 41:10',
          'Psalm 56:3',
          '1 Corinthians 16:13',
          'Proverbs 28:1'
        ]
      },

      worry: {
        id: 'worry',
        name: 'Worry & Anxiety',
        description: 'Overcoming worry through trust in God',
        verses: [
          'Matthew 6:25-34',
          'Philippians 4:6-7',
          '1 Peter 5:7',
          'Psalm 55:22',
          'Isaiah 41:10',
          'Proverbs 12:25',
          'Luke 12:22-26',
          'Psalm 94:19'
        ]
      },

      trust: {
        id: 'trust',
        name: 'Trust',
        description: 'Trusting in God\'s plan and timing',
        verses: [
          'Proverbs 3:5-6',
          'Psalm 37:5',
          'Isaiah 26:4',
          'Nahum 1:7',
          'Psalm 9:10',
          'Jeremiah 17:7',
          'Psalm 56:3',
          'Proverbs 29:25'
        ]
      },

      guidance: {
        id: 'guidance',
        name: 'Guidance',
        description: 'God\'s direction for our lives',
        verses: [
          'Psalm 32:8',
          'Proverbs 3:5-6',
          'Isaiah 30:21',
          'Psalm 25:9',
          'John 16:13',
          'Psalm 73:24',
          'James 1:5',
          'Psalm 143:10'
        ]
      },

      temptation: {
        id: 'temptation',
        name: 'Temptation',
        description: 'Overcoming temptation and sin',
        verses: [
          '1 Corinthians 10:13',
          'James 1:13-14',
          'Hebrews 2:18',
          'Matthew 26:41',
          'James 4:7',
          '1 John 2:16',
          'Galatians 5:16',
          '2 Timothy 2:22'
        ]
      },

      holySpirit: {
        id: 'holySpirit',
        name: 'Holy Spirit',
        description: 'The person and work of the Holy Spirit',
        verses: [
          'John 14:26',
          'Acts 1:8',
          'Romans 8:26',
          'Galatians 5:22-23',
          '1 Corinthians 2:10',
          'John 16:13',
          'Ephesians 1:13',
          'Romans 8:11'
        ]
      },

      perseverance: {
        id: 'perseverance',
        name: 'Perseverance',
        description: 'Enduring through trials',
        verses: [
          'James 1:12',
          'Romans 5:3-4',
          'Hebrews 12:1',
          'Galatians 6:9',
          '2 Thessalonians 3:13',
          '1 Corinthians 15:58',
          'James 5:11',
          'Revelation 2:10'
        ]
      },

      service: {
        id: 'service',
        name: 'Service',
        description: 'Serving God and others',
        verses: [
          'Galatians 5:13',
          'Matthew 20:28',
          '1 Peter 4:10',
          'Mark 10:45',
          'Colossians 3:23-24',
          'Romans 12:11',
          'Joshua 24:15',
          'Hebrews 13:16'
        ]
      },

      gratitude: {
        id: 'gratitude',
        name: 'Gratitude',
        description: 'Thankfulness to God',
        verses: [
          '1 Thessalonians 5:18',
          'Psalm 107:1',
          'Colossians 3:15',
          'Ephesians 5:20',
          'Psalm 100:4',
          'Philippians 4:6',
          '1 Chronicles 16:34',
          'Colossians 2:7'
        ]
      },

      unity: {
        id: 'unity',
        name: 'Unity',
        description: 'Unity in the body of Christ',
        verses: [
          'Psalm 133:1',
          'Ephesians 4:3',
          '1 Corinthians 1:10',
          'John 17:21',
          'Romans 12:5',
          'Colossians 3:14',
          'Philippians 2:2',
          '1 Peter 3:8'
        ]
      },

      repentance: {
        id: 'repentance',
        name: 'Repentance',
        description: 'Turning from sin to God',
        verses: [
          'Acts 3:19',
          '2 Chronicles 7:14',
          'Luke 13:3',
          '1 John 1:9',
          'Ezekiel 18:30',
          'Mark 1:15',
          'Acts 17:30',
          '2 Peter 3:9'
        ]
      },

      eternalLife: {
        id: 'eternalLife',
        name: 'Eternal Life',
        description: 'The promise of life with God forever',
        verses: [
          'John 3:16',
          '1 John 5:11-12',
          'John 10:28',
          'Romans 6:23',
          'John 11:25-26',
          '1 John 2:25',
          'John 17:3',
          'Titus 1:2'
        ]
      },

      comfort: {
        id: 'comfort',
        name: 'Comfort',
        description: 'God\'s comfort in times of trouble',
        verses: [
          '2 Corinthians 1:3-4',
          'Psalm 23:4',
          'Matthew 5:4',
          'Psalm 34:18',
          'Isaiah 40:1',
          'Psalm 119:50',
          'John 14:1',
          'Romans 15:4'
        ]
      },

      godsWord: {
        id: 'godsWord',
        name: 'God\'s Word',
        description: 'The power and importance of Scripture',
        verses: [
          '2 Timothy 3:16',
          'Hebrews 4:12',
          'Psalm 119:105',
          'Matthew 4:4',
          'John 17:17',
          'Psalm 19:7-8',
          'Isaiah 40:8',
          'Psalm 119:11'
        ]
      }
    };
  }

  /**
   * Get all topics
   */
  getAllTopics() {
    return Object.values(this.topics);
  }

  /**
   * Get a specific topic by ID
   */
  getTopic(topicId) {
    return this.topics[topicId] || null;
  }

  /**
   * Get popular topics for quick access
   */
  getPopularTopics() {
    return [
      this.topics.salvation,
      this.topics.faith,
      this.topics.love,
      this.topics.hope,
      this.topics.grace,
      this.topics.peace,
      this.topics.prayer,
      this.topics.forgiveness
    ];
  }

  /**
   * Search topics by name
   */
  searchTopics(query) {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.topics).filter(topic =>
      topic.name.toLowerCase().includes(lowerQuery) ||
      topic.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get random topic
   */
  getRandomTopic() {
    const topics = Object.values(this.topics);
    return topics[Math.floor(Math.random() * topics.length)];
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.bibleTopics = new BibleTopics();
});
