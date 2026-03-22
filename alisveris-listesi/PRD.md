# PRD — Alışveriş Listesi Uygulaması

## 1. Proje Genel Bakışı

### Proje Adı
Alışveriş Listesi (Alışveriş Listesi Uygulaması)

### Proje Tipi
CRUD uygulaması — basit tek sayfa mobil öncelikli alışveriş listesi yönetimi.

### Temel İşlev
Kullanıcıların alışveriş ürünlerini kategori bazlı gruplandırarak eklemesine, işaretlemesine ve silmesine olanak tanıyan mobil öncelikli web uygulaması.

### Hedef Kullanıcı Kitlesi
- Mobil cihazlarda alışveriş listesi oluşturmak isteyen kullanıcılar
- Türkçe konuşan kullanıcılar (tüm etiketler ve mesajlar Türkçe)

---

## 2. Hedef Platform

| Platform | Destek |
|----------|--------|
| Web (Mobil Tarayıcı) | ✅ Birincil hedef |
| Web (Masaüstü) | ✅ İkincil destek |
| Native Mobile App | ❌ Kapsam dışı |

### Responsive Strateji
- Mobile-first tasarım (375px–428px birincil hedef)
- Tablet (768px+) ve masaüstü (1024px+) genişletilmiş görünüm
- Touch-friendly büyük dokunma hedefleri (min 44px)

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Ürün Yönetimi

#### Ürün Ekleme
- Kullanıcı ürün adı girebilir (metin input)
- Kullanıcı kategori seçebilir (dropdown)
- Miktar belirtebilir (opsiyonel, varsayılan: 1)
- Ürün ekle butonu veya Enter tuşu ile ekleme
- Boş ürün adı ile ekleme engellenmeli
- Aynı isimde ürün varsa uyarı gösterilmeli (opsiyonel: birleştir veya ayrı ekle sor)

#### Ürün Silme
- Her ürün satırında silme butonu (çöp kutusu ikonu)
- Tıklama ile anında silme (onay gerektirmez)
- Silinen ürün geri alınamaz

#### Ürün İşaretleme (Tik)
- Her ürün satırında onay kutusu (checkbox)
- İşaretli ürünler görsel olarak üstü çizili ve soluk renkli gösterilir
- İşaretli ürünler listenin altına taşınabilir (opsiyonel)

#### Ürün Düzenleme
- Ürün adına tıklayarak inline düzenleme
- Miktar ve kategori değiştirilebilir

### 3.2 Kategori Yönetimi

#### Sabit Kategoriler
| Kategori | ikon | Renk |
|----------|------|------|
| Manav | 🥬 | Yeşil |
| Kasap | 🥩 | Kırmızı |
| Market | 🛒 | Mavi |
| Fırın | 🍞 | Turuncu |
| Meyve | 🍎 | Kırmızı |
| Temizlik | 🧹 | Mor |
| Diğer | 📦 | Gri |

#### Kategorilere Göre Gruplama
- Ürünler kategori bazlı gruplanmış şekilde görüntülenir
- Her kategorinin altında o kategorideki ürünler listelenir
- Kategori başlıkları ürün sayısını gösterir
- Boş kategoriler gizlenir

### 3.3 Liste Yönetimi

#### Liste Temizleme
- Tüm işaretli ürünleri sil butonu
- Tüm listeyi sil butonu (onay gerektirir)

#### Liste Aktarma
- Liste localStorage'da otomatik kaydedilir
- Sayfa yenilendiğinde liste korunur

---

## 4. Teknik Gereksinimler

### 4.1 Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14+ (App Router) |
| UI Kütüphanesi | React 18+ |
| Dil | TypeScript (strict mode) |
| Stil | Tailwind CSS |
| Veri Saklama | localStorage |
| Paket Yönetimi | npm |

### 4.2 Proje Yapısı

```
alisveris-listesi/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Ana sayfa (alışveriş listesi)
│   │   └── globals.css         # Global stiller
│   ├── components/
│   │   ├── ShoppingList.tsx    # Ana alışveriş listesi bileşeni
│   │   ├── ProductItem.tsx      # Tek ürün satırı
│   │   ├── ProductForm.tsx      # Ürün ekleme formu
│   │   ├── CategoryGroup.tsx   # Kategori grubu
│   │   └── EmptyState.tsx      # Boş durum bileşeni
│   ├── hooks/
│   │   ├── useLocalStorage.ts  # localStorage hook
│   │   └── useShoppingList.ts  # Alışveriş listesi state yönetimi
│   ├── types/
│   │   └── index.ts            # TypeScript tipleri
│   └── lib/
│       └── categories.ts        # Kategori sabitleri
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

### 4.3 Veri Modeli

```typescript
interface Product {
  id: string;           // UUID
  name: string;         // Ürün adı
  category: CategoryId; // Kategori ID
  quantity: number;     // Miktar (varsayılan: 1)
  checked: boolean;     // İşaretli mi?
  createdAt: number;   // Unix timestamp
}

type CategoryId = 'manav' | 'kasap' | 'market' | 'fırın' | 'meyve' | 'temizlik' | 'diğer';

interface Category {
  id: CategoryId;
  label: string;        // Görüntülenen isim
  emoji: string;        // Emoji ikon
  color: string;        // Tailwind renk sınıfı
}
```

### 4.4 State Yönetimi

- React useState + useReducer temel state
- Custom hook (useShoppingList) ile liste işlemleri
- localStorage senkronizasyonu için useEffect
- Client-side rendering (no SSR for this page)

---

## 5. UI/UX Gereksinimleri

### 5.1 Sayfa Düzeni

```
┌─────────────────────────────┐
│  🛒 Alışveriş Listesi       │  ← Header (sticky)
├─────────────────────────────┤
│  [Ürün adı...] [+ Ekle]     │  ← Ürün ekleme formu
├─────────────────────────────┤
│  🥬 Manav (2)                │  ← Kategori başlığı
│  ☐ Domates (3)               │
│  ☑ Salatalık (2)             │  ← İşaretli (soluk)
│  🥩 Kasap (1)                │
│  ☐ Kıyma (500g)              │
│  ...                         │
├─────────────────────────────┤
│  [✓ İşaretlileri Temizle]   │  ← Alt aksiyon butonları
│  [🗑 Tümünü Sil]             │
└─────────────────────────────┘
```

### 5.2 Renk Paleti

| Kullanım | Renk | Tailwind |
|----------|------|----------|
| Primary | Indigo | indigo-600 |
| Background | Gray-50 | gray-50 |
| Surface | White | white |
| Text Primary | Gray-900 | gray-900 |
| Text Secondary | Gray-500 | gray-500 |
| Success | Green | green-500 |
| Danger | Red | red-500 |
| Border | Gray-200 | gray-200 |

### 5.3 Tipografi

| Element | Font | Boyut | Ağırlık |
|---------|------|-------|---------|
| Header Başlık | System | 20px | 700 |
| Kategori Başlık | System | 16px | 600 |
| Ürün Adı | System | 16px | 500 |
| Miktar | System | 14px | 400 |
| Buton | System | 14px | 600 |

### 5.4 Spacing

- Sayfa padding: 16px (mobile), 24px (tablet+)
- Ürün satırı padding: 12px dikey
- Kategori grupları arası: 8px
- Form elementleri arası: 12px

### 5.5 Etkileşimler

| Aksiyon | Davranış |
|---------|----------|
| Ürün ekle | Form submit → liste başına ekle → input temizle → focus |
| Ürün sil | İkon tıkla → anında sil → animasyonlu çıkar |
| Ürün işaretle | Checkbox tıkla → görsel güncelle → ürün aşağı kay |
| Ürün düzenle | Ürün adına çift tıkla → inline edit mode → blur/enter ile kaydet |

### 5.6 Animasyonlar

| Element | Animasyon | Süre |
|---------|-----------|------|
| Ürün ekleme | Fade + slide down | 200ms |
| Ürün silme | Fade + slide left | 150ms |
| Checkbox | Scale + color | 150ms |
| Kategori collapse | Height transition | 200ms |

---

## 6. Non-Fonksiyonel Gereksinimler

### 6.1 Performans

- First Contentful Paint < 1.5s
- Time to Interactive < 2s
- Lighthouse Performance > 90

### 6.2 Erişilebilirlik

- WCAG 2.1 AA uyumluluğu
- Klavye navigasyonu
- Ekran okuyucu uyumluluğu (ARIA labels)
- Yeterli renk kontrastı

### 6.3 Tarayıcı Desteği

- Chrome 90+
- Safari 14+
- Firefox 90+
- Edge 90+

---

## 7. Kapsam Dışı

- Kullanıcı girişi / kimlik doğrulama
- Bulut senkronizasyonu / veritabanı
- Çoklu liste desteği
- Ürün barkod tarama
- Paylaşım / işbirliği
- Offline-first / PWA

---

## 8. Başarı Kriterleri

1. ✅ Kullanıcı ürün ekleyebilir
2. ✅ Kullanıcı ürün silebilir
3. ✅ Kullanıcı ürün işaretleyebilir (tik)
4. ✅ Ürünler kategoriye göre gruplanır
5. ✅ Liste sayfa yenilemede korunur (localStorage)
6. ✅ Mobil cihazlarda kullanılabilir
7. ✅ Hata olmadan çalışır

---

## 9. Ekranlar (Screens)

| # | Ekran Adı | Tür | Açıklama |
|---|-----------|-----|----------|
| 1 | Ana Alışveriş Listesi | main-view | Ana liste görünümü, kategori grupları, ürünler, form |
| 2 | Ürün Ekleme Durumu | empty-state | Liste boşken gösterilen rehber ekranı |
| 3 | Silme Onay Modalı | modal | Tümünü sil butonu onay modalı |
