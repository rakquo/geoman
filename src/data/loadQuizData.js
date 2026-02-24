const dataModules = import.meta.glob('./**/*.json')

export async function loadQuizData(continentId, category) {
  const path = `./${continentId}/${category}.json`
  const loader = dataModules[path]
  if (!loader) return null
  const module = await loader()
  return module.default
}
