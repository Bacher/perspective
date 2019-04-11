export function renameIds(item) {
  item.id = item._id;
  item._id = undefined;
  item.__v = undefined;

  return item;
}
