export const toPublicUrl = (filename: string) => {
  const clean = filename.replace(/^uploads\//, '').replace(/^\/+/, '');
  return `/api/upload/${clean}`;
};
