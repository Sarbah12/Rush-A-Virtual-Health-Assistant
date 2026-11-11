// Health Library articles, bundled so they work offline. Written in plain
// English for Ghana, based on WHO and Ghana Health Service public guidance.
// General information only.

export type Article = {
  id: string;
  title: string;
  summary: string;
  category: 'Everyday health' | 'Long-term conditions' | 'Women & children' | 'Mind' | 'First aid';
  icon: string;
  minutes: number;
  sections: { heading?: string; body: string[] }[];
  source: string;
};

export const ARTICLES: Article[] = [
  {
    id: 'malaria',
    title: 'Malaria: prevent, test, treat',
    summary: 'Every fever in Ghana should be tested for malaria. Here is how to stay protected.',
    category: 'Everyday health',
    icon: 'bug-outline',
    minutes: 3,
    sections: [
      { body: ['Malaria is spread by mosquitoes that bite mostly between dusk and dawn. It is common all year in Ghana and is most dangerous for young children and pregnant women.'] },
      { heading: 'Prevent', body: ['Sleep under a treated mosquito net every night, even in the dry season.', 'Clear standing water around the house: old tins, tyres and blocked gutters.', 'Pregnant women should attend antenatal care, where they receive medicine (SP) to prevent malaria.'] },
      { heading: 'Test every fever', body: ['A fever, chills, headache, body pains or vomiting can be malaria. Get a rapid diagnostic test (RDT) at a pharmacy, chemical shop or clinic. It takes about 15 minutes.', 'Do not take malaria medicine without a positive test. Many fevers have other causes, such as typhoid or infections that need different treatment.'] },
      { heading: 'Treat fully', body: ['If the test is positive, take the full course of the medicine you are given (usually an ACT such as artemether-lumefantrine), even when you feel better.', 'Go to hospital at once for confusion, fits, very yellow eyes, dark urine, trouble breathing or being unable to drink.'] },
    ],
    source: 'Ghana Health Service National Malaria Elimination Programme; WHO',
  },
  {
    id: 'blood-pressure',
    title: 'Understanding high blood pressure',
    summary: 'It often has no symptoms, but it is a leading cause of stroke. Know your numbers.',
    category: 'Long-term conditions',
    icon: 'heart-outline',
    minutes: 3,
    sections: [
      { body: ['Blood pressure is written as two numbers, like 120/80. The top number is the pressure when the heart beats; the bottom is when it rests.', 'A reading of 140/90 or higher on several days means high blood pressure (hypertension). Many people in Ghana have it without knowing.'] },
      { heading: 'Why it matters', body: ['Over time, high blood pressure damages the heart, kidneys, eyes and brain. It is the main cause of strokes.'] },
      { heading: 'What helps', body: ['Use less salt and fewer stock cubes; flavour food with fresh herbs, ginger and garlic instead.', 'Walk briskly for 30 minutes on most days.', 'Eat more vegetables, fruit, beans and whole grains.', 'Limit alcohol and do not smoke.', 'If you are given medicine, take it every day, even when you feel well. Do not stop without talking to your health worker.'] },
      { heading: 'Get help now if', body: ['Your reading is 180/120 or higher, especially with chest pain, a severe headache, weakness on one side or trouble speaking. Call 112.'] },
    ],
    source: 'WHO hypertension fact sheet; Ghana Ministry of Health',
  },
  {
    id: 'diabetes',
    title: 'Living well with diabetes',
    summary: 'Everyday habits that keep blood sugar steady and prevent complications.',
    category: 'Long-term conditions',
    icon: 'water-outline',
    minutes: 4,
    sections: [
      { body: ['Diabetes means the body cannot control blood sugar properly. Common signs are being very thirsty, passing urine often, tiredness, blurred vision and slow-healing wounds.'] },
      { heading: 'Food', body: ['Fill half the plate with vegetables, a quarter with protein (fish, beans, eggs, chicken) and a quarter with starch.', 'Choose smaller portions of fufu, banku, kenkey and rice, and prefer unripe plantain, brown rice and beans.', 'Cut down on sugary drinks, malt drinks and sweet bread.'] },
      { heading: 'Everyday care', body: ['Take your medicine as prescribed and check your sugar if you have a meter.', 'Check your feet every day for cuts or sores, and never walk barefoot.', 'Have your eyes, kidneys and blood pressure checked regularly.'] },
      { heading: 'Low sugar (hypo)', body: ['Shaking, sweating, confusion or feeling faint can mean low sugar. Take something sweet at once, such as juice or sweets, then eat a meal.'] },
    ],
    source: 'WHO diabetes fact sheet; International Diabetes Federation',
  },
  {
    id: 'hydration',
    title: 'Staying hydrated in the heat',
    summary: 'How much to drink, the warning signs of dehydration, and how to use ORS.',
    category: 'Everyday health',
    icon: 'sunny-outline',
    minutes: 2,
    sections: [
      { body: ['Ghana’s heat, especially during the harmattan and in the north, makes the body lose water quickly. Most adults need about 2 to 3 litres a day, more when working outside.'] },
      { heading: 'Warning signs', body: ['Dark urine, headache, dizziness, a dry mouth and tiredness are early signs. Confusion or fainting needs urgent care.'] },
      { heading: 'Tips', body: ['Drink clean water regularly, not only when thirsty.', 'Rest in the shade during the hottest hours.', 'For diarrhoea or heavy sweating, use ORS (oral rehydration salts) mixed exactly as the packet says.', 'Babies under 6 months only need breast milk, even in hot weather.'] },
    ],
    source: 'WHO; Ghana Health Service',
  },
  {
    id: 'sickle-cell',
    title: 'Sickle cell: what to know',
    summary: 'Know your genotype, and how to prevent painful crises.',
    category: 'Long-term conditions',
    icon: 'fitness-outline',
    minutes: 3,
    sections: [
      { body: ['Sickle cell disease is inherited. People with SS or SC genotypes have the disease; people with AS carry the trait and are usually well.', 'Two AS partners have a 1 in 4 chance with each pregnancy of a child with sickle cell disease. Knowing your genotype helps you plan.'] },
      { heading: 'Preventing crises', body: ['Drink plenty of water every day.', 'Avoid getting too cold or too hot, and rest when tired.', 'Sleep under a mosquito net. Malaria can trigger a crisis.', 'Take folic acid and any preventive medicine your clinic gives you, and keep up with vaccines.'] },
      { heading: 'Get help now if', body: ['There is severe pain that will not ease, a fever, chest pain, trouble breathing, a swollen belly, weakness on one side, or a painful erection that lasts more than 2 hours.'] },
    ],
    source: 'Sickle Cell Foundation of Ghana; WHO',
  },
  {
    id: 'pregnancy',
    title: 'A healthy pregnancy',
    summary: 'Antenatal visits, warning signs, and what to eat.',
    category: 'Women & children',
    icon: 'heart-circle-outline',
    minutes: 3,
    sections: [
      { body: ['Start antenatal care as early as possible and attend at least 8 visits. Antenatal care is free under the NHIS.'] },
      { heading: 'Look after yourself', body: ['Take the iron and folic acid tablets you are given.', 'Sleep under a treated mosquito net.', 'Eat a varied diet with beans, fish, eggs, leafy greens such as kontomire, and fruit.', 'Avoid alcohol, smoking and medicines not prescribed for you.'] },
      { heading: 'Go to hospital at once for', body: ['Bleeding from the vagina, a severe headache or blurred vision, swelling of the face or hands, fits, fever, severe belly pain, or the baby moving less than usual.'] },
    ],
    source: 'Ghana Health Service Maternal Health Programme; WHO',
  },
  {
    id: 'child-danger-signs',
    title: 'Danger signs in young children',
    summary: 'When a sick child needs a health worker immediately.',
    category: 'Women & children',
    icon: 'happy-outline',
    minutes: 2,
    sections: [
      { body: ['Young children can become very sick quickly. Take a child to a health facility at once if they have any of these:'] },
      { body: ['Unable to drink or breastfeed.', 'Vomiting everything.', 'Fits (convulsions).', 'Very sleepy or hard to wake.', 'Fast breathing, or the chest pulling in with each breath.', 'Fever in a baby under 2 months.'] },
      { heading: 'At home', body: ['Keep breastfeeding and giving fluids during any illness.', 'For diarrhoea, give ORS and zinc.', 'Keep up with vaccines on the Child Health Record book (the "weighing card").'] },
    ],
    source: 'WHO Integrated Management of Childhood Illness (IMCI)',
  },
  {
    id: 'mental-health',
    title: 'Looking after your mind',
    summary: 'Stress and low mood are common. Small steps help, and so does talking.',
    category: 'Mind',
    icon: 'leaf-outline',
    minutes: 3,
    sections: [
      { body: ['Everyone feels stressed or sad sometimes. When low mood, worry or poor sleep lasts more than two weeks and makes daily life hard, it is worth getting support.'] },
      { heading: 'Small steps', body: ['Talk to someone you trust: a friend, family member, faith leader or health worker.', 'Keep a routine: regular sleep, meals and some movement every day.', 'Spend time outside and with people you enjoy.', 'Limit alcohol, which makes low mood worse.'] },
      { heading: 'Get help', body: ['Mental health care is available at many hospitals and through the Mental Health Authority.', 'If you are thinking of ending your life or are in danger, call 112 now or go to the nearest hospital. You deserve support.'] },
    ],
    source: 'Mental Health Authority Ghana; WHO',
  },
  {
    id: 'first-aid-burns-cuts',
    title: 'First aid: cuts and burns',
    summary: 'What to do in the first minutes, and what not to put on a burn.',
    category: 'First aid',
    icon: 'bandage-outline',
    minutes: 2,
    sections: [
      { heading: 'Cuts', body: ['Press firmly on the wound with a clean cloth for 10 minutes to stop bleeding.', 'Rinse with clean water and cover with a clean dressing.', 'Get help for deep cuts, cuts that will not stop bleeding, or animal bites. Ask about a tetanus injection.'] },
      { heading: 'Burns', body: ['Cool the burn under cool running water for 20 minutes.', 'Remove rings or tight clothing nearby, but not anything stuck to the skin.', 'Cover loosely with cling film or a clean cloth.', 'Do not put toothpaste, oil, eggs or butter on a burn.', 'Go to hospital for large, deep or facial burns, and for burns on children.'] },
    ],
    source: 'Ghana Red Cross Society; WHO',
  },
  {
    id: 'typhoid-water',
    title: 'Typhoid and safe water',
    summary: 'How typhoid spreads and simple ways to keep food and water safe.',
    category: 'Everyday health',
    icon: 'beaker-outline',
    minutes: 2,
    sections: [
      { body: ['Typhoid spreads through food and water contaminated with sewage. It causes a long fever, stomach pain, headache and weakness, and needs testing and antibiotics from a health worker.'] },
      { heading: 'Prevent', body: ['Drink treated, boiled or sealed water.', 'Wash hands with soap after the toilet and before eating or cooking.', 'Eat food that is freshly cooked and hot. Wash fruit and vegetables in clean water.', 'A typhoid vaccine is available at many clinics.'] },
    ],
    source: 'WHO typhoid fact sheet',
  },
];

export const ARTICLE_CATEGORIES = [...new Set(ARTICLES.map((a) => a.category))];
