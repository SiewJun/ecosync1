const nock = require('nock');
const { geocodeAddress } = require('../utils/googleMaps');

describe('Google Maps API', () => {
  it('should geocode an address', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/geocode/json')
      .query(true)
      .reply(200, { results: [{ geometry: { location: { lat: 40.7128, lng: -74.0060 } } }], status: 'OK' });

    const location = await geocodeAddress('New York, NY');
    expect(location).toEqual({ lat: 40.7128, lng: -74.0060 });
  });
});