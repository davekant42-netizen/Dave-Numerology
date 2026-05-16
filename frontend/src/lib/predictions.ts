// Predictions based on Root Number (personality / core self)
// and Destiny Number (life path / purpose).

export const ROOT_PREDICTIONS: Record<number, { title: string; planet: string; text: string }> = {
  1: { title: 'The Leader', planet: 'Sun',
    text: 'Natural-born leader with strong willpower, confidence, and originality. You inspire others and prefer to take charge. Watch out for stubbornness and ego.' },
  2: { title: 'The Diplomat', planet: 'Moon',
    text: 'Sensitive, intuitive, and emotionally intelligent. You thrive in partnerships and bring harmony. Beware of mood swings and over-dependency.' },
  3: { title: 'The Optimist', planet: 'Jupiter',
    text: 'Wise, expressive, and spiritually inclined. You attract opportunities and enjoy teaching or guiding. Avoid scattering your energy.' },
  4: { title: 'The Strategist', planet: 'Rahu',
    text: 'Sharp-minded, unconventional, and innovative. You see what others miss. Stay grounded — sudden gains can be matched by sudden losses.' },
  5: { title: 'The Communicator', planet: 'Mercury',
    text: 'Quick-witted, adaptable, and business-savvy. You excel at communication and trade. Avoid restlessness and impulsive decisions.' },
  6: { title: 'The Lover', planet: 'Venus',
    text: 'Charming, artistic, and luxury-loving. You value beauty, relationships, and comfort. Beware of indulgence and emotional drama.' },
  7: { title: 'The Mystic', planet: 'Ketu',
    text: 'Spiritual, analytical, and deeply introspective. You seek truth and purpose. Avoid isolation and overthinking.' },
  8: { title: 'The Achiever', planet: 'Saturn',
    text: 'Disciplined, ambitious, and karmic. Success comes through patience and hard work. Beware delays — they shape your strength.' },
  9: { title: 'The Warrior', planet: 'Mars',
    text: 'Courageous, energetic, and protective. You fight for what is right. Channel your fire — anger and impatience are pitfalls.' },
};

export const DESTINY_PREDICTIONS: Record<number, { title: string; text: string }> = {
  1: { title: 'Path of Authority',
    text: 'Your life purpose is to lead, pioneer, and create independent paths. Recognition comes through original ideas and bold action.' },
  2: { title: 'Path of Harmony',
    text: 'You are here to build bridges, mediate, and nurture. Success unfolds through collaboration, intuition, and emotional wisdom.' },
  3: { title: 'Path of Wisdom',
    text: 'Knowledge, teaching, and self-expression define your journey. You uplift others through words, learning, and spiritual insight.' },
  4: { title: 'Path of Transformation',
    text: 'Your destiny involves disrupting norms and reinventing systems. Expect a non-linear journey full of breakthroughs.' },
  5: { title: 'Path of Freedom',
    text: 'Travel, networks, and ideas shape your purpose. You are meant to connect people and master change.' },
  6: { title: 'Path of Love',
    text: 'Family, art, and service form your core mission. Wealth and happiness flow through beauty and relationships.' },
  7: { title: 'Path of the Seeker',
    text: 'Your life is a search for meaning. Research, spirituality, and solitude reveal your highest gifts.' },
  8: { title: 'Path of Mastery',
    text: 'Karma, structure, and material achievement define your road. Persistence converts obstacles into legacy.' },
  9: { title: 'Path of the Warrior',
    text: 'You are destined for action, leadership, and protection of others. Courage and discipline bring lasting success.' },
};

export function getCombinedPrediction(rn: number, dn: number): string {
  if (rn === dn) {
    return `Your Root and Destiny numbers are both ${rn} — a powerful alignment. Your inner nature and life purpose move as one, giving you focused, magnetic energy. The lessons of ${ROOT_PREDICTIONS[rn].planet} dominate your journey.`;
  }
  const harmonious: Record<number, number[]> = {
    1: [1, 2, 3, 5, 9],
    2: [1, 2, 3, 5, 7],
    3: [1, 2, 3, 5, 6, 7, 9],
    4: [4, 5, 6, 8],
    5: [1, 2, 3, 5, 6, 7, 9],
    6: [3, 4, 5, 6, 8, 9],
    7: [2, 3, 5, 7, 9],
    8: [4, 5, 6, 8],
    9: [1, 3, 5, 6, 7, 9],
  };
  const compatible = harmonious[rn]?.includes(dn);
  if (compatible) {
    return `Root ${rn} (${ROOT_PREDICTIONS[rn].planet}) and Destiny ${dn} blend harmoniously. Your personality naturally supports your life mission — trust your instincts and act with confidence. Opportunities will reach you through people and timing.`;
  }
  return `Root ${rn} (${ROOT_PREDICTIONS[rn].planet}) and Destiny ${dn} create a dynamic tension. Your inner nature pulls one way while your life path asks another — this friction is your growth engine. Patience, balance, and conscious choices unlock your highest potential.`;
}
