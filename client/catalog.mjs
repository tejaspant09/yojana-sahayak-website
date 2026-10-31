export function filterCurrentCatalog(catalog, asOf = new Date()) {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(asOf);
  const records = catalog.records.filter(record => {
    const expiry = record.source.valid_until;
    if (expiry === null) return true;
    if (typeof expiry !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
      throw new Error('Invalid source review date.');
    }
    return expiry >= day;
  });
  return { ...catalog, records };
}
