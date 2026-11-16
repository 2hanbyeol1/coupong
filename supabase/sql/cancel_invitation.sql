-- 초대 취소
-- 초대한 사람 또는 그룹 관리자가 아직 수락되지 않은 초대를 삭제할 수 있음
create policy "Enable delete pending invitation for inviter or organization admin"
  on public.invitations for delete to authenticated
  using (
    accepted is null
    and (
      invited_by = (select auth.uid())
      or public.is_organization_admin(organization_id)
    )
  );

-- 되돌리기
-- drop policy if exists "Enable delete pending invitation for inviter or organization admin" on public.invitations;
