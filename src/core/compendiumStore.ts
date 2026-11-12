// src/core/compendiumStore.ts
import { CasefileId, DemonAvatar, encodeBulathPayload } from './bulathCodec';
import { RuntimeVariables } from './schema';

const COMPENDIUM_STORAGE_KEY = 'aftermonsoon_puskola_compendium_v1';

export interface PuskolaEntry {
  id: string;
  casefile: CasefileId;
  category: 'AVATARA' | 'LAKUNU';
  sinhalaScript: string;
  sinhalaTitle: string;
  englishGloss: string;
  inscription: string;
  forensicNotes?: string;
}

export const PUSKOLA_ENTRIES: ReadonlyArray<PuskolaEntry> = [
  // Folio I: Kalu Kumara (Nugegoda)
  { id: 'HANDUN_KUMARA', casefile: 'CF01', category: 'AVATARA', sinhalaScript: 'හඳුන් කුමාර අවතාරය', sinhalaTitle: 'Handun Kumāra Avatāra', englishGloss: 'The Sandalwood Prince of Dusk', inscription: 'Manifests through wet jasmine, bruised Nil Manel petals, and dream-impersonation when water and vanity taboos are broken at Sandhya dusk. Bound by facing the clay effigy East toward sweet kevum.' },
  { id: 'VATHA_KUMARA', casefile: 'CF01', category: 'AVATARA', sinhalaScript: 'වාත කුමාර අවතාරය', sinhalaTitle: 'Vātha Kumāra Avatāra', englishGloss: 'The Wind & Humour Prince', inscription: 'Strikes the chest with crushing sleep paralysis and freezing drafts when dusk oil-snacks or night laundry carry his scent indoors. Bound by facing the clay effigy West toward charred pulutu.' },
  { id: 'taboo_bathed_dusk', casefile: 'CF01', category: 'LAKUNU', sinhalaScript: 'සන්ධ්යා දිය නෑම', sinhalaTitle: 'Sandhyā Diya Nāma', englishGloss: 'Apex Bruise · Bathing at the Dusk Watch', inscription: 'Darkening at the betel leaf tip. Pouring water over the crown during the 6:00 PM Samayam watch opens the body to lingering canal spirits.' },
  { id: 'taboo_hair_unbound', casefile: 'CF01', category: 'LAKUNU', sinhalaScript: 'වරල මුදා හැරීම', sinhalaTitle: 'Varala Mudā Harima', englishGloss: 'Left Vein Knot · Wet Unbound Hair', inscription: 'Knotted lateral vein on the left blade. Damp hair left loose after dark draws the Balma of Kalu Kumara across the threshold.' },
  { id: 'taboo_mirror_unshrouded', casefile: 'CF01', category: 'LAKUNU', sinhalaScript: 'කැඩපත බැල්ම', sinhalaTitle: 'Kādapatha Balma', englishGloss: 'Midrib Pinhole · Unshrouded Night Mirror', inscription: 'Pinhole perforation through the central rib. An uncovered glass facing the mattress traps the sleeper between waking reflection and dream.' },
  { id: 'taboo_sweet_snacks', casefile: 'CF01', category: 'LAKUNU', sinhalaScript: 'තෙල්කම කැවිලි', sinhalaTitle: 'Telkama Kevili', englishGloss: 'Right Oily Sheen · Dusk Oil-Cakes', inscription: 'Translucent oil stain on the right blade. Consuming fried kevum or sweetmeats in solitude at dusk invites hunger across the hearth.' },
  { id: 'taboo_laundry', casefile: 'CF01', category: 'LAKUNU', sinhalaScript: 'රාත්රී සළු පිළි', sinhalaTitle: 'Rāthri Salu Pili', englishGloss: 'Petiole Rot · Garments Left Past Six', inscription: 'Blackened rot at the leaf stem. Intimate cloth left hanging in the evening rain absorbs the scent of the three-way crossroads.' },

  // Folio II: Mala Mohini (Kandy)
  { id: 'MALA_MOHINI', casefile: 'CF02', category: 'AVATARA', sinhalaScript: 'මළ මෝහිනී අවතාරය', sinhalaTitle: 'Mala Mōhinī Avatāra', englishGloss: 'The Weeping Widow of the Culvert', inscription: 'Binds solitary travelers who answer her voice or meet her pupil-less gaze in the mist, locking the host in catatonic grief.' },
  { id: 'RATI_MOHINI', casefile: 'CF02', category: 'AVATARA', sinhalaScript: 'රති මෝහිනී අවතාරය', sinhalaTitle: 'Rati Mōhinī Avatāra', englishGloss: 'The Mimetic Bride of the Bamboo', inscription: 'Takes root when a traveler mirrors her hand gesture or accepts the shrouded Kesel Kanda infant bundle into their forearms.' },
  { id: 'taboo_walked_samayam', casefile: 'CF02', category: 'LAKUNU', sinhalaScript: 'මධ්යම යාම ගමන', sinhalaTitle: 'Maddhama Yāma Gamana', englishGloss: 'Apex Bruise · Midnight Wayside Solitude', inscription: 'Clouded leaf apex. Walking beside giant bamboo and water culverts at 11:45 PM without companions exposes the pulse to Tanikama.' },
  { id: 'taboo_answered_call', casefile: 'CF02', category: 'LAKUNU', sinhalaScript: 'අකාල නද පිළිතුරු', sinhalaTitle: 'Akāla Nada Pilituru', englishGloss: 'Left Vein Knot · Answering the Mist Call', inscription: 'Twisted left vein. Speaking aloud to a disembodied childhood nickname in the fog surrenders verbal jurisdiction.' },
  { id: 'taboo_met_eyes', casefile: 'CF02', category: 'LAKUNU', sinhalaScript: 'නේත්ර බැල්ම', sinhalaTitle: 'Netra Balma', englishGloss: 'Midrib Pinhole · Direct Ocular Contact', inscription: 'Pierced midrib. Lifting the chin from the wet asphalt to look into her dark eyes allows her glamour to override waking sight.' },
  { id: 'taboo_mirrored_gesture', casefile: 'CF02', category: 'LAKUNU', sinhalaScript: 'ඉඟි අනුකරණ', sinhalaTitle: 'Ingi Anukarana', englishGloss: 'Right Oily Sheen · Mirrored Hand Gesture', inscription: 'Milky Kaduru-sap sheen on the right veins. Brushing the forehead in imitation of her wet fingers locks the motor tendons.' },
  { id: 'taboo_accepted_bundle', casefile: 'CF02', category: 'LAKUNU', sinhalaScript: 'බිලි දරු පොරොන්දුව', sinhalaTitle: 'Bili Daru Pōrōnduva', englishGloss: 'Petiole Rot · The Infant Bundle Contract', inscription: 'Severed stem base. Opening the arms to catch the falling white bundle snaps the Pirith Nula and seals the surrogate burden.' },

  // Folio III: Riri Yaka (Matara)
  { id: 'MARU_RIRI', casefile: 'CF03', category: 'AVATARA', sinhalaScript: 'මරු රීරි අවතාරය', sinhalaTitle: 'Maru Rīri Avatāra', englishGloss: 'The Monkey-Faced Blood Hunter', inscription: 'Manifests through boiling arterial fever and simian chattering in the rafters when dusk pulutu oil, raw blood, or crimson Wada Mal taboos are broken.' },
  { id: 'SOHON_RIRI', casefile: 'CF03', category: 'AVATARA', sinhalaScript: 'සොහොන් රීරි අවතාරය', sinhalaTitle: 'Sohon Rīri Avatāra', englishGloss: 'The Charnel Corpse-Straddler', inscription: 'Draws warmth from the extremities until the host lies rigid as timber when twilight termite mounds or hearth-ash offerings are violated. Appeased only by the Peduru Dāne mock funeral.' },
  { id: 'taboo_fried_pulutu', casefile: 'CF03', category: 'LAKUNU', sinhalaScript: 'ලේ ඉරබටුව පුළුටු', sinhalaTitle: 'Lē Irabatuwa Pulutu', englishGloss: 'Apex Bruise · Frying Meat at Red Sunset', inscription: 'Crimson darkening at the leaf tip. Frying fish or meat in coconut oil during the 6:00 PM red sunset draws Riri Yaka from the cremation grounds.' },
  { id: 'taboo_unwashed_blood', casefile: 'CF03', category: 'LAKUNU', sinhalaScript: 'අසේදූ ලේ බිඳුව', sinhalaTitle: 'Asēdū Lē Binduva', englishGloss: 'Left Vein Knot · Unwashed Threshold Blood', inscription: 'Knotted left lateral vein. Leaving raw fish blood or a nicked thumb unwashed by the wellside stone surrenders an arterial tether.' },
  { id: 'taboo_plucked_wadamal', casefile: 'CF03', category: 'LAKUNU', sinhalaScript: 'රතු වද මල් නෙළීම', sinhalaTitle: 'Rathu Wada Mal Nelīma', englishGloss: 'Midrib Pinhole · Plucking Red Hibiscus at Dusk', inscription: 'Central rib perforation. Tearing crimson shoe-flowers from the boundary hedge after sunset invites his ritual flower indoors.' },
  { id: 'taboo_crossed_anthill', casefile: 'CF03', category: 'LAKUNU', sinhalaScript: 'හුඹහ තරණය', sinhalaTitle: 'Humbaha Tharanaya', englishGloss: 'Right Oily Sheen · Crossing the Termite Mound', inscription: 'Red-laterite sheen across the right veins. Stepping over a chimney termite mound in the twilight watch disturbs the chthonic boundary.' },
  { id: 'taboo_tasted_hearth_ash', casefile: 'CF03', category: 'LAKUNU', sinhalaScript: 'අගස් නොදී අනුභවය', sinhalaTitle: 'Agas Nodī Anubhavaya', englishGloss: 'Petiole Rot · Omitting the Hearth Ember Offering', inscription: 'Blackened stem base. Tasting fried pulutu straight from the iron pan without casting the first pinch into the coals breaks the hearth truce.' },

  // Folio IV: Mahasona (Anuradhapura)
  { id: 'JAYASENA_YAKA', casefile: 'CF04', category: 'AVATARA', sinhalaScript: 'ජයසේන යක්ෂ අවතාරය', sinhalaTitle: 'Jayasēna Yaksha Avatāra', englishGloss: 'The Headless Duelist of Gothaimbara', inscription: 'Manifests through violent vertigo, uneven dragging footsteps, and cervical lock when midnight whistling, unwarded meat, or backward-glancing taboos are broken at a Thummansala junction.' },
  { id: 'MAHA_SOHONA', casefile: 'CF04', category: 'AVATARA', sinhalaScript: 'මහසොහොන් අවතාරය', sinhalaTitle: 'Maha Sohōn Avatāra', englishGloss: 'The Boar-Headed Charnel Titan', inscription: 'Strikes between the shoulder blades with a freezing five-fingered charcoal handprint (Anguru Atha) when crossroads ash pots or cemetery boundary stones are violated. Humbled only through Kōlama card derision and Dummala fire.' },
  { id: 'taboo_whistled_crossroads', casefile: 'CF04', category: 'LAKUNU', sinhalaScript: 'තුන්මන්සල උරුහම් බෑම', sinhalaTitle: 'Thummansala Uruham Bāma', englishGloss: 'Apex Bruise · Whistling at the Three-Way Junction', inscription: 'Ash-grey bruising at the leaf apex. Whistling or humming aloud while crossing a three-way gravel junction at midnight summons the cemetery watch.' },
  { id: 'taboo_carried_uncovered_meat', casefile: 'CF04', category: 'LAKUNU', sinhalaScript: 'අනාරක්ෂිත දඩ මස්', sinhalaTitle: 'Anārakshitha Dada Mas', englishGloss: 'Left Vein Knot · Unwarded Boar Meat Parcel', inscription: 'Knotted left vein. Carrying parcelled wild boar or roasted meat past a culvert at night without sealing it with lime and cold iron draws his hunger.' },
  { id: 'taboo_looked_back_snap', casefile: 'CF04', category: 'LAKUNU', sinhalaScript: 'ආපසු හැරී බැලීම', sinhalaTitle: 'Āpasu Haerī Baelīma', englishGloss: 'Midrib Pinhole · Turning at the Snapped Branch', inscription: 'Pierced central midrib. Whipping the neck around when a dead palu branch snaps behind your heels on the tank bund exposes the spine to his strike.' },
  { id: 'taboo_stepped_ash_pot', casefile: 'CF04', category: 'LAKUNU', sinhalaScript: 'බිඳුම් මුට්ටිය පෑගීම', sinhalaTitle: 'Bindum Muttiya Pāgīma', englishGloss: 'Right Oily Sheen · Trampling the Crossroads Ash Pot', inscription: 'Greasy soot sheen across the right veins. Rolling over or kicking a shattered clay exorcism pot at the junction transfers the previous victim’s warrant.' },
  { id: 'taboo_cursed_boar_shadow', casefile: 'CF04', category: 'LAKUNU', sinhalaScript: 'සොහොන් කණුවට අභියෝගය', sinhalaTitle: 'Sohon Kanuvata Abhiyōgaya', englishGloss: 'Petiole Rot · Challenging the Boundary Shadow', inscription: 'Charred stem base. Shouting a curse or swinging at the boar-headed silhouette on the cemetery boundary stone invites the crushing Anguru Atha blow.' },
];

export function loadDiscoveredCompendium(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPENDIUM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function syncRuntimeToCompendium(state: RuntimeVariables, casefile: CasefileId, passageId: string): string[] {
  const current = new Set<string>(loadDiscoveredCompendium());
  for (const entry of PUSKOLA_ENTRIES) {
    if (entry.category === 'LAKUNU' && (state[entry.id] === true || state[`$${entry.id}`] === true)) current.add(entry.id);
  }
  if (passageId.startsWith('Outcome_') || passageId.startsWith('Sastra_') || passageId.startsWith('Midnight_')) {
    const { payload } = encodeBulathPayload(state, casefile);
    if (payload.blemishes.length > 0) current.add(payload.avatar as DemonAvatar);
  }
  const updated = Array.from(current);
  try {
    window.localStorage.setItem(COMPENDIUM_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getEntriesByCasefile(casefile: CasefileId): PuskolaEntry[] {
  const matches = PUSKOLA_ENTRIES.filter((e) => e.casefile === casefile);
  return matches.length > 0 ? matches : PUSKOLA_ENTRIES.filter((e) => e.category === 'AVATARA');
}
