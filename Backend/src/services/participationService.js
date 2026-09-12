export const recordParticipation = async ({ giveawayId, userId }) => {
  if (!giveawayId || !userId) {
    throw new Error('giveawayId and userId are required');
  }

  return {
    success: true,
    data: { giveawayId, userId, status: 'joined' }
  };
};
