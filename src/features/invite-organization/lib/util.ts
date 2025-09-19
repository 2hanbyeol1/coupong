const getInvitationEmailHtml = (organizationName: string, token: string) => {
  return `
    <div style="display: flex;justify-content: center;align-items: center;flex-direction: column;margin: 2rem 0;">
      <div style="margin-bottom: 1rem;font-size: 1rem;color: #898989;">Coupong</div>
      <h1 style="font-weight: 700;font-size: 1.4rem;margin-bottom: 0.9rem;">그룹 초대</h1>
      <p style="font-size: 1rem;margin-bottom: 0.4rem;">그룹 <span style="font-weight: 500;">${organizationName}</span> 에서 초대를 보냈어요!</p>
      <p style="margin-bottom: 3rem;">그룹에 참여하고 쿠폰을 공유해보세요</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/invitation/${token}" style="background-color: rgb(56, 153, 112); color: white; border-radius: 6px; padding: 0.5rem 1rem; text-decoration: none;">초대장 보기</a>
    </div>
  `;
};

export { getInvitationEmailHtml };
