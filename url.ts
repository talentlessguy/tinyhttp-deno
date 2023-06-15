/**
 * This function joins a list of paths with / (forward slash)
 * @param {boolean} padLeft - pads the final path with leading slash if it does not exist
 * @param {boolean} padRight - pads the final path with trailling slash if it does not exist
 * @param {string[]} [path] - array of paths.
 */
const pathJoin = (padLeft: boolean, padRight: boolean, ...path: string[]) => {
  const pathArray: string[] = []
  path.forEach((p) => {
    if (typeof p !== 'string') return
    p.split('/').forEach((element) =>
      element.length ? pathArray.push(element) : null
    )
  })
  let finalString = pathArray.join('/')

  if (padLeft && finalString.charCodeAt(0) !== 47) {
    finalString = '/' + finalString
  }
  if (padRight && finalString.charCodeAt(finalString.length - 1) !== 47) {
    finalString += '/'
  }

  return finalString
}

export { pathJoin }
