export type LocationId = 'davis' | 'hayward';

export type MapLink = {
  label: string;
  query: string;
};

export type SunsetLocation = {
  id: LocationId;
  /** Name as written in the report heading, e.g. `**South Hayward 9/15 晚霞指数：…**`. */
  name: string;
  region: string;
  /** Repo-relative directory holding this location's `YYYY-MM-DD.md` reports. */
  reportDir: string;
  mapLinks: MapLink[];
};

export const LOCATIONS: SunsetLocation[] = [
  {
    id: 'davis',
    name: 'Davis',
    region: 'Davis, California',
    reportDir: 'reports',
    mapLinks: [
      { label: '城西农田路', query: 'County Road 31 Davis CA' },
      { label: 'West Davis Pond', query: 'West Davis Pond Davis CA' },
    ],
  },
  {
    id: 'hayward',
    name: 'South Hayward',
    region: 'South Hayward · SF Bay Area',
    reportDir: 'reports/hayward',
    mapLinks: [
      { label: 'Hayward Regional Shoreline', query: 'Hayward Shoreline Interpretive Center Hayward CA' },
      { label: 'Garin Regional Park', query: 'Garin Regional Park Hayward CA' },
    ],
  },
];

export const DEFAULT_LOCATION_ID: LocationId = 'davis';

export function isLocationId(value: unknown): value is LocationId {
  return LOCATIONS.some((location) => location.id === value);
}

export function getLocation(id: LocationId) {
  return LOCATIONS.find((location) => location.id === id) ?? LOCATIONS[0];
}
