export function getDirection3D(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];

  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

  const distDxs = [dx,dy,dz]

  const forward = [
    dx / distance,
    dy / distance,
    dz / distance
  ];
  return [forward,distDxs,distance];
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}