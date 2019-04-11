export function renameIds(arr) {
  for (const item of arr) {
    item.id = item._id;
    item._id = undefined;
    item.__v = undefined;
  }
}
