export async function getTurkeyChargingPoints() {
  // Gerçek senaryoda: https://api.example.com/tr-charging-stations
  const response = await fetch('https://api.openechargemap.io/v3/poi/?countrycode=TR&key=YOUR_API_KEY');
  return await response.json();
}