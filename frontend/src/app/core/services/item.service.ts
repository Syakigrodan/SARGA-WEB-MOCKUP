import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Item } from '../models';

export interface ItemListResponse {
  success: boolean;
  count: number;
  items: Item[];
  message?: string;
}

export interface ItemResponse {
  success: boolean;
  item: Item;
  message?: string;
}

export interface ItemFilterParams {
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/items`;

  getItems(params?: ItemFilterParams): Observable<ItemListResponse> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('q', params.search);

    return this.http.get<ItemListResponse>(this.baseUrl, { params: httpParams });
  }

  getItemById(id: string): Observable<ItemResponse> {
    return this.http.get<ItemResponse>(`${this.baseUrl}/${id}`);
  }

  createItem(itemData: Partial<Item>): Observable<ItemResponse> {
    return this.http.post<ItemResponse>(this.baseUrl, itemData);
  }
}
