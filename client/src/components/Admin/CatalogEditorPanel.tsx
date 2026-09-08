import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Select } from '@/components/UI/Select';
import { Modal } from '@/components/UI/Modal';
import type { Bread, Recipe, Restaurant } from '@/types';

const fieldClass =
  'w-full rounded-xl border border-line bg-bg-elevated px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-bright/25';

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export type CatalogEditor =
  | { kind: 'restaurant'; mode: 'create' }
  | { kind: 'restaurant'; mode: 'edit'; item: Restaurant }
  | { kind: 'recipe'; mode: 'create' }
  | { kind: 'recipe'; mode: 'edit'; item: Recipe }
  | { kind: 'bread'; mode: 'create' }
  | { kind: 'bread'; mode: 'edit'; item: Bread };

export function CatalogEditorPanel({
  editor,
  saving,
  onCancel,
  onSaveRestaurant,
  onSaveRecipe,
  onSaveBread,
}: {
  editor: CatalogEditor | null;
  saving: boolean;
  onCancel: () => void;
  onSaveRestaurant: (payload: Record<string, unknown>) => Promise<void>;
  onSaveRecipe: (payload: Record<string, unknown>) => Promise<void>;
  onSaveBread: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const title = editor
    ? editor.mode === 'create'
      ? `Add ${editor.kind}`
      : `Edit ${editor.kind}`
    : '';

  return (
    <Modal open={!!editor} title={title} onClose={onCancel} size="lg" closeDisabled={saving}>
      {editor?.kind === 'restaurant' ? (
        <RestaurantForm
          key={editor.mode === 'edit' ? editor.item.id : 'restaurant-create'}
          initial={editor.mode === 'edit' ? editor.item : null}
          saving={saving}
          onSubmit={onSaveRestaurant}
          onCancel={onCancel}
        />
      ) : null}
      {editor?.kind === 'recipe' ? (
        <RecipeForm
          key={editor.mode === 'edit' ? editor.item.id : 'recipe-create'}
          initial={editor.mode === 'edit' ? editor.item : null}
          saving={saving}
          onSubmit={onSaveRecipe}
          onCancel={onCancel}
        />
      ) : null}
      {editor?.kind === 'bread' ? (
        <BreadForm
          key={editor.mode === 'edit' ? editor.item.id : 'bread-create'}
          initial={editor.mode === 'edit' ? editor.item : null}
          saving={saving}
          onSubmit={onSaveBread}
          onCancel={onCancel}
        />
      ) : null}
    </Modal>
  );
}

function RestaurantForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: Restaurant | null;
  saving: boolean;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [country, setCountry] = useState(initial?.country ?? 'Nigeria');
  const [priceRange, setPriceRange] = useState(initial?.priceRange ?? '₦₦');
  const [image, setImage] = useState(initial?.image ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [rating, setRating] = useState(String(initial?.rating ?? 4.5));
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  useEffect(() => {
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setAddress(initial?.address ?? '');
    setCity(initial?.city ?? '');
    setState(initial?.state ?? '');
    setCountry(initial?.country ?? 'Nigeria');
    setPriceRange(initial?.priceRange ?? '₦₦');
    setImage(initial?.image ?? '');
    setPhone(initial?.phone ?? '');
    setEmail(initial?.email ?? '');
    setWebsite(initial?.website ?? '');
    setRating(String(initial?.rating ?? 4.5));
    setFeatured(initial?.featured ?? false);
  }, [initial]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      state: emptyToNull(state),
      country: country.trim() || 'Nigeria',
      priceRange: priceRange.trim(),
      image: image.trim(),
      phone: emptyToNull(phone),
      email: emptyToNull(email),
      website: emptyToNull(website),
      rating: Number(rating) || 0,
      featured,
    });
  }

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required className="sm:col-span-2" />
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-ink">Description</span>
        <textarea className={fieldClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </label>
      <Input label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} required className="sm:col-span-2" />
      <Select
        label="Price range"
        value={priceRange}
        onChange={(e) => setPriceRange(e.target.value)}
        options={[
          { label: '₦', value: '₦' },
          { label: '₦₦', value: '₦₦' },
          { label: '₦₦₦', value: '₦₦₦' },
        ]}
      />
      <Input label="Rating" type="number" min={0} max={5} step={0.1} value={rating} onChange={(e) => setRating(e.target.value)} />
      <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
      <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} className="sm:col-span-2" />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" loading={saving}>
          {initial ? 'Save restaurant' : 'Create restaurant'}
        </Button>
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function RecipeForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: Recipe | null;
  saving: boolean;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [prepTime, setPrepTime] = useState(String(initial?.prepTime ?? 20));
  const [cookTime, setCookTime] = useState(String(initial?.cookTime ?? 30));
  const [servings, setServings] = useState(String(initial?.servings ?? 4));
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 'MEDIUM');
  const [instructions, setInstructions] = useState((initial?.instructions ?? []).join('\n'));
  const [allergens, setAllergens] = useState((initial?.allergens ?? []).join(', '));
  const [dietaryTags, setDietaryTags] = useState((initial?.dietaryTags ?? []).join(', '));
  const [breadSlug, setBreadSlug] = useState(initial?.breadSlug ?? '');
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  useEffect(() => {
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setImage(initial?.image ?? '');
    setPrepTime(String(initial?.prepTime ?? 20));
    setCookTime(String(initial?.cookTime ?? 30));
    setServings(String(initial?.servings ?? 4));
    setDifficulty(initial?.difficulty ?? 'MEDIUM');
    setInstructions((initial?.instructions ?? []).join('\n'));
    setAllergens((initial?.allergens ?? []).join(', '));
    setDietaryTags((initial?.dietaryTags ?? []).join(', '));
    setBreadSlug(initial?.breadSlug ?? '');
    setFeatured(initial?.featured ?? false);
  }, [initial]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const steps = splitLines(instructions);
    if (!steps.length) {
      window.alert('Add at least one instruction line.');
      return;
    }
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 1,
      difficulty,
      instructions: steps,
      allergens: splitCsv(allergens),
      dietaryTags: splitCsv(dietaryTags),
      breadSlug: emptyToNull(breadSlug),
      featured,
    });
  }

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Select
        label="Difficulty"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as Recipe['difficulty'])}
        options={[
          { label: 'Easy', value: 'EASY' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'Advanced', value: 'ADVANCED' },
        ]}
      />
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-ink">Description</span>
        <textarea className={fieldClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </label>
      <Input label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} required className="sm:col-span-2" />
      <Input label="Prep minutes" type="number" min={0} value={prepTime} onChange={(e) => setPrepTime(e.target.value)} required />
      <Input label="Cook minutes" type="number" min={0} value={cookTime} onChange={(e) => setCookTime(e.target.value)} required />
      <Input label="Servings" type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} required />
      <Input label="Bread slug (optional)" value={breadSlug} onChange={(e) => setBreadSlug(e.target.value)} />
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-ink">Instructions (one step per line)</span>
        <textarea className={fieldClass} rows={5} value={instructions} onChange={(e) => setInstructions(e.target.value)} required />
      </label>
      <Input label="Allergens (comma-separated)" value={allergens} onChange={(e) => setAllergens(e.target.value)} />
      <Input label="Dietary tags (comma-separated)" value={dietaryTags} onChange={(e) => setDietaryTags(e.target.value)} />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" loading={saving}>
          {initial ? 'Save recipe' : 'Create recipe'}
        </Button>
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function BreadForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: Bread | null;
  saving: boolean;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'Classic');
  const [number, setNumber] = useState(String(initial?.number ?? 1));
  const [allergens, setAllergens] = useState((initial?.allergens ?? []).join(', '));
  const [portionNote, setPortionNote] = useState(initial?.portionNote ?? '');
  const [prepMinutes, setPrepMinutes] = useState(String(initial?.prepMinutes ?? ''));
  const [reference, setReference] = useState(initial?.reference ?? '');
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  useEffect(() => {
    setName(initial?.name ?? '');
    setSubtitle(initial?.subtitle ?? '');
    setDescription(initial?.description ?? '');
    setImage(initial?.image ?? '');
    setCategory(initial?.category ?? 'Classic');
    setNumber(String(initial?.number ?? 1));
    setAllergens((initial?.allergens ?? []).join(', '));
    setPortionNote(initial?.portionNote ?? '');
    setPrepMinutes(String(initial?.prepMinutes ?? ''));
    setReference(initial?.reference ?? '');
    setFeatured(initial?.featured ?? false);
  }, [initial]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      image: image.trim(),
      category: category.trim(),
      number: Number(number) || 1,
      allergens: splitCsv(allergens),
      portionNote: emptyToNull(portionNote),
      prepMinutes: prepMinutes.trim() ? Number(prepMinutes) : null,
      reference: emptyToNull(reference),
      featured,
    });
  }

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Number" type="number" min={1} value={number} onChange={(e) => setNumber(e.target.value)} required />
      <Input label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} required className="sm:col-span-2" />
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-ink">Description</span>
        <textarea className={fieldClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </label>
      <Input label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} required className="sm:col-span-2" />
      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <Input label="Prep minutes" type="number" min={0} value={prepMinutes} onChange={(e) => setPrepMinutes(e.target.value)} />
      <Input label="Allergens (comma-separated)" value={allergens} onChange={(e) => setAllergens(e.target.value)} className="sm:col-span-2" />
      <Input label="Portion note" value={portionNote} onChange={(e) => setPortionNote(e.target.value)} className="sm:col-span-2" />
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-ink">Reference</span>
        <textarea className={fieldClass} rows={2} value={reference} onChange={(e) => setReference(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" loading={saving}>
          {initial ? 'Save bread' : 'Create bread'}
        </Button>
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
