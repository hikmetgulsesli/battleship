```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Tactile Pantry"
This design system moves beyond the utility of a standard shopping list to create **"The Tactile Pantry."** The goal is to transform a mundane chore into a premium, editorial experience. Instead of a rigid, clinical grid, we employ a philosophy of **Organic Layering**. 

We break the "template" look by using intentional asymmetry in header placements and high-contrast typography scales. By utilizing the `Sora` typeface’s geometric yet warm characteristics, we treat the mobile screen like a high-end lifestyle magazine—spacious, authoritative, and deeply intentional. The UI doesn't just show data; it "curates" the user’s shopping journey through soft depth and tonal shifts rather than harsh dividers.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a sophisticated e-commerce orange, balanced by architectural grays.

*   **Primary Identity:** Use `primary` (#9b3f00) for high-impact brand moments and `primary_container` (#ff7a2c) for interactive energy.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background shifts. For example, a list of items (`surface_container_lowest`) should sit atop a `surface` background.
*   **Surface Hierarchy:** Use nested tiers to define importance.
    *   **Level 0 (Base):** `surface` (#f8f6f5) - The canvas.
    *   **Level 1 (Sections):** `surface_container_low` (#f2f0f0) - Subtle groupings.
    *   **Level 2 (Cards):** `surface_container_lowest` (#ffffff) - Active content.
*   **The "Glass & Gradient" Rule:** Floating action buttons or top navigation bars should utilize **Glassmorphism**. Apply `surface` at 80% opacity with a `backdrop-blur` of 12px. For main CTAs, use a linear gradient from `primary` to `primary_container` at a 135-degree angle to add "soul" and dimension.

---

## 3. Typography: Editorial Authority
We use `Sora` (referred to in tokens as `plusJakartaSans` for system compatibility) to create a clear, rhythmic hierarchy.

| Role | Token | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-md` | 2.75rem | Bold | Hero "List Names" (e.g., *Haftalık Market*) |
| **Headline** | `headline-sm` | 1.5rem | SemiBold | Category headers (e.g., *Manav*) |
| **Title** | `title-md` | 1.125rem | Medium | Product names in the list |
| **Body** | `body-md` | 0.875rem | Regular | Descriptions, quantities (e.g., *2 Adet*) |
| **Label** | `label-md` | 0.75rem | Bold | Metadata, price tags, "Sepete Eklendi" |

*   **Turkish Language Note:** Ensure `Sora` is loaded with full Latin-5 support for characters like `İ, ı, Ğ, ğ, Ü, ü, Ş, ş, Ö, ö, Ç, ç`.

---

## 4. Elevation & Depth: Tonal Layering
Traditional "drop shadows" are a fallback, not a primary tool. We use light to guide the eye.

*   **The Layering Principle:** Achieve depth by stacking tokens. A `surface_container_lowest` card (White) placed on a `surface` background (Light Gray) provides all the separation needed.
*   **Ambient Shadows:** For floating elements (e.g., "Add Item" button), use a shadow color tinted with `on_surface` at 6% opacity, with a 24px blur and 8px Y-offset. This mimics natural light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` token at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components: Bespoke Elements

### Buttons & Interaction
*   **Primary CTA:** Uses `primary` background with `on_primary` text. Minimum height is **48px** to exceed the 44px touch target requirement. Corners are `xl` (1.5rem) for a pill-like, premium feel.
*   **Secondary/Ghost:** No background. Use `primary` text with a `surface_container_high` hover state.

### Lists & Cards (The Shopping Experience)
*   **Item Cards:** Use `surface_container_lowest` with `md` (0.75rem) rounded corners. 
*   **The Divider Rule:** Forbid the use of line dividers between products. Use `spacing-4` (1rem) of vertical white space to separate items.
*   **Touch Targets:** Every interactive row (e.g., checking an item) must maintain a minimum height of **44px** and a width of **100%**.

### Input Fields
*   **The "Soft Input":** Text fields should use `surface_container_low` background with no border. Upon focus, a 2px "Ghost Border" of `primary` appears at 40% opacity.

### Navigation (Mobile-First)
*   **Floating Bottom Bar:** A glassmorphic container (`surface` @ 85% + blur) with `Lucide React` icons in `on_surface_variant`. The active state uses a `primary` tint.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `spacing-8` or `spacing-10` for top-level padding to create an editorial, "high-end" feel.
*   **Do** use `secondary_container` for "Success" states (e.g., marking an item as bought) to keep the palette warm and cohesive.
*   **Do** ensure all `Lucide` icons use a `stroke-width` of 1.5px to match the refined weight of `Sora`.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#2e2f2f) for better readability on OLED and LCD screens.
*   **Don't** use "Standard" 4px rounded corners. Stick to the `md` (12px) and `xl` (24px) scale to maintain the soft, modern aesthetic.
*   **Don't** use lines to separate "Quantity" from "Product Name." Use alignment and typography weight to distinguish them.

---

## 7. Dark Mode Strategy
When switching to dark mode, the `surface` tokens invert.
*   `surface` becomes `#0e0e0e` (Inverse Surface).
*   `surface_container_lowest` (previously white) becomes a deep charcoal, allowing the `primary` orange to glow with increased saturation (`inverse_primary`). 
*   **Crucial:** Reduce the opacity of Glassmorphism blurs in dark mode to avoid "milky" overlays; keep it sharp and deep.```