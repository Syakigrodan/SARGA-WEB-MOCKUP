import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('sarga_token');
  const activeOrgId = localStorage.getItem('sarga_active_org_id');

  let headers = req.headers;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  if (activeOrgId) {
    headers = headers.set('x-organization-id', activeOrgId);
  }

  const clonedReq = req.clone({ headers });
  return next(clonedReq);
};
