import Config from "../../core/config.js";

function computeScore(
  pattern,
  {
    errors = 0,
    currentLocation = 0,
    expectedLocation = 0,
    distance = Config.distance,
    ignoreLocation = Config.ignoreLocation,
  } = {}
) {
  const accuracy = errors / pattern.length;

  if (ignoreLocation) return accuracy;

  const proximity = Math.abs(expectedLocation - currentLocation);

  if (!distance) return proximity ? 1.0 : accuracy;

  return accuracy + proximity / distance;
}

export default computeScore;
