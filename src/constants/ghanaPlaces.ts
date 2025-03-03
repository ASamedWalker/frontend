// src/constants/ghanaPlaces.ts
import { Place } from '../utils/placeStorage';

/**
 * Popular locations in Ghana for offline search capability
 */
export const GHANA_PLACES: Place[] = [
  {
    id: 'place-1',
    name: 'Accra Mall',
    address: 'Spintex Road, Accra',
    coordinates: { latitude: 5.6355, longitude: -0.1726 },
    type: 'mall'
  },
  {
    id: 'place-2',
    name: 'Makola Market',
    address: 'Central Accra, Greater Accra',
    coordinates: { latitude: 5.5454, longitude: -0.2107 },
    type: 'market'
  },
  {
    id: 'place-3',
    name: 'Labadi Beach',
    address: 'La, Accra, Greater Accra',
    coordinates: { latitude: 5.5606, longitude: -0.1488 },
    type: 'entertainment'
  },
  {
    id: 'place-4',
    name: 'University of Ghana',
    address: 'Legon, Accra, Greater Accra',
    coordinates: { latitude: 5.6502, longitude: -0.1858 },
    type: 'education'
  },
  {
    id: 'place-5',
    name: 'Kotoka International Airport',
    address: 'Airport Road, Accra',
    coordinates: { latitude: 5.6051, longitude: -0.1669 },
    type: 'transportation'
  },
  {
    id: 'place-6',
    name: 'Kwame Nkrumah Memorial Park',
    address: 'Central Accra, Greater Accra',
    coordinates: { latitude: 5.5476, longitude: -0.2074 },
    type: 'landmark'
  },
  {
    id: 'place-7',
    name: '37 Military Hospital',
    address: 'Liberation Road, Accra',
    coordinates: { latitude: 5.5860, longitude: -0.1840 },
    type: 'health'
  },
  {
    id: 'place-8',
    name: 'A&C Mall',
    address: 'East Legon, Accra',
    coordinates: { latitude: 5.6377, longitude: -0.1649 },
    type: 'mall'
  },
  {
    id: 'place-9',
    name: 'Osu Castle',
    address: 'Osu, Accra',
    coordinates: { latitude: 5.5436, longitude: -0.1870 },
    type: 'landmark'
  },
  {
    id: 'place-10',
    name: 'National Theatre of Ghana',
    address: 'South Liberia Road, Accra',
    coordinates: { latitude: 5.5506, longitude: -0.2008 },
    type: 'entertainment'
  },
  {
    id: 'place-11',
    name: 'West Hills Mall',
    address: 'Weija, Accra',
    coordinates: { latitude: 5.5506, longitude: -0.3308 },
    type: 'mall'
  },
  {
    id: 'place-12',
    name: 'Jamestown Lighthouse',
    address: 'Jamestown, Accra',
    coordinates: { latitude: 5.5320, longitude: -0.2139 },
    type: 'landmark'
  },
  {
    id: 'place-13',
    name: 'Tema Harbour',
    address: 'Tema, Greater Accra',
    coordinates: { latitude: 5.6298, longitude: -0.0196 },
    type: 'transportation'
  },
  {
    id: 'place-14',
    name: 'Independence Square',
    address: 'Black Star Square, Accra',
    coordinates: { latitude: 5.5451, longitude: -0.1973 },
    type: 'landmark'
  },
  {
    id: 'place-15',
    name: 'Kumasi Central Market',
    address: 'Adum, Kumasi, Ashanti Region',
    coordinates: { latitude: 6.6886, longitude: -1.6233 },
    type: 'market'
  },
  {
    id: 'place-16',
    name: 'Manhyia Palace',
    address: 'Manhyia, Kumasi, Ashanti Region',
    coordinates: { latitude: 6.7095, longitude: -1.6135 },
    type: 'landmark'
  },
  {
    id: 'place-17',
    name: 'Cape Coast Castle',
    address: 'Cape Coast, Central Region',
    coordinates: { latitude: 5.1053, longitude: -1.2414 },
    type: 'landmark'
  },
  {
    id: 'place-18',
    name: 'Kakum National Park',
    address: 'Cape Coast, Central Region',
    coordinates: { latitude: 5.3513, longitude: -1.3815 },
    type: 'nature'
  },
  {
    id: 'place-19',
    name: 'Elmina Castle',
    address: 'Elmina, Central Region',
    coordinates: { latitude: 5.0846, longitude: -1.3496 },
    type: 'landmark'
  },
  {
    id: 'place-20',
    name: 'Mole National Park',
    address: 'Larabanga, Northern Region',
    coordinates: { latitude: 9.2617, longitude: -1.8555 },
    type: 'nature'
  }
];

export default GHANA_PLACES;