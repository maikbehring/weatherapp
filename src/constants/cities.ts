export interface City {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
}

export const cities = [
	{ id: "berlin", name: "Berlin", latitude: 52.52, longitude: 13.405 },
	{ id: "hamburg", name: "Hamburg", latitude: 53.5511, longitude: 9.9937 },
	{ id: "munich", name: "München", latitude: 48.1374, longitude: 11.5755 },
	{ id: "cologne", name: "Köln", latitude: 50.9375, longitude: 6.9603 },
] satisfies City[];

export type CityId = (typeof cities)[number]["id"];

export const cityIds = cities.map((city) => city.id) as [
	CityId,
	...CityId[],
];

export const cityMap: Record<CityId, City> = cities.reduce(
	(result, city) => {
		result[city.id] = city;
		return result;
	},
	{} as Record<CityId, City>,
);


