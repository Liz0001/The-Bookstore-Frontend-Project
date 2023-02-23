
export async function getJSON(url) {
  let rawData = await fetch(url)
  let data = await rawData.json()
  return data
} 