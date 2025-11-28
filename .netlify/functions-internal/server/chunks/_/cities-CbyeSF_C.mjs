const cities = [
  { id: "berlin", name: "Berlin", latitude: 52.52, longitude: 13.405 },
  { id: "hamburg", name: "Hamburg", latitude: 53.5511, longitude: 9.9937 },
  { id: "munich", name: "M\xFCnchen", latitude: 48.1374, longitude: 11.5755 },
  { id: "cologne", name: "K\xF6ln", latitude: 50.9375, longitude: 6.9603 }
];
const cityIds = cities.map((city) => city.id);
const cityMap = cities.reduce(
  (result, city) => {
    result[city.id] = city;
    return result;
  },
  {}
);

export { cityMap as a, cityIds as b, cities as c };
//# sourceMappingURL=cities-CbyeSF_C.mjs.map
