export const getGiveawaySummary = async () => {
  return {
    success: true,
    data: [
      {
        id: 'demo-giveaway-1',
        title: 'Summer Elite Drop',
        prize: '$500 Amazon Gift Card',
        status: 'live'
      }
    ]
  };
};
