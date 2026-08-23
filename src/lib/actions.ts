'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { AVATAR_COLORS, AVATAR_SYMBOLS } from '@/lib/avatars';
import { limpiarInstagram } from '@/lib/instagram';
import { mensajeDeError } from '@/lib/errores';
import {
  CUBO,
  MAX_BYTES_SALIDA,
  esRutaDeAvatarDe,
  olfatear,
  rutaDeAvatar,
} from '@/lib/avatar-foto';

export type ActionResult = { error?: string; ok?: true };

/** Mejor un mensaje que una excepcion cuando faltan las variables de entorno. */
const SIN_PROYECTO = 'La app no tiene base de datos configurada todavía.';

async function rpc(fn: string, args: Record<string, unknown>): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: SIN_PROYECTO };
  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  return error ? { error: mensajeDeError(error) } : { ok: true };
}

// ------------------------------------------------------------------ grupos
export async function createGroupAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_group', {
    p_name: String(formData.get('name') ?? '').trim(),
    p_starting_points: Number(formData.get('starting_points') ?? 1000),
    p_drift: Number(formData.get('drift') ?? 0.5),
    p_liquidity: Number(formData.get('liquidity') ?? 300),
    p_dispute_hours: Number(formData.get('dispute_hours') ?? 24),
  });
  if (error) return { error: mensajeDeError(error) };
  redirect(`/grupos/${data}`);
}

export async function joinGroupAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('join_group', {
    p_code: String(formData.get('code') ?? '').trim(),
  });
  if (error) return { error: mensajeDeError(error) };
  redirect(`/grupos/${data}`);
}

// ------------------------------------------------------------------ apuestas
export async function createMarketAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const labels = formData.getAll('option_label').map((v) => String(v).trim());
  const oddsList = formData.getAll('option_odds').map((v) => Number(v));

  const options = labels
    .map((label, i) => ({ label, odds: oddsList[i] }))
    .filter((o) => o.label.length > 0);

  if (options.length < 2) return { error: 'Hacen falta al menos 2 opciones con nombre.' };
  if (options.some((o) => !Number.isFinite(o.odds) || o.odds < 1.01 || o.odds > 50)) {
    return { error: 'Las cuotas tienen que estar entre 1,01 y 50,00.' };
  }

  const groupId = String(formData.get('group_id'));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_market', {
    p_group: groupId,
    p_title: String(formData.get('title') ?? '').trim(),
    p_description: String(formData.get('description') ?? '').trim() || null,
    p_closes_at: new Date(String(formData.get('closes_at'))).toISOString(),
    p_stakes_public: formData.get('stakes_public') === 'on',
    p_options: options,
  });
  if (error) return { error: mensajeDeError(error) };
  redirect(`/grupos/${groupId}/apuesta/${data}`);
}

export async function placeWagerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = await rpc('place_wager', {
    p_market: String(formData.get('market_id')),
    p_option: String(formData.get('option_id')),
    p_stake: Number(formData.get('stake')),
  });
  if (result.ok) revalidatePath(`/grupos/${formData.get('group_id')}`, 'layout');
  return result;
}

export async function voidWagerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = await rpc('void_wager', {
    p_wager: String(formData.get('wager_id')),
    p_reason: String(formData.get('reason') ?? '').trim(),
  });
  if (result.ok) revalidatePath(`/grupos/${formData.get('group_id')}`, 'layout');
  return result;
}

export async function closeMarketAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = await rpc('close_market', { p_market: String(formData.get('market_id')) });
  if (result.ok) revalidatePath(`/grupos/${formData.get('group_id')}`, 'layout');
  return result;
}

export async function setResultAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const option = String(formData.get('option_id') ?? '');
  if (!option) return { error: 'Elige cuál fue el resultado.' };
  const result = await rpc('set_result', {
    p_market: String(formData.get('market_id')),
    p_option: option,
    p_note: String(formData.get('note') ?? '').trim() || null,
  });
  if (result.ok) revalidatePath(`/grupos/${formData.get('group_id')}`, 'layout');
  return result;
}

export async function cancelMarketAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = await rpc('cancel_market', {
    p_market: String(formData.get('market_id')),
    p_reason: String(formData.get('reason') ?? '').trim(),
  });
  if (result.ok) revalidatePath(`/grupos/${formData.get('group_id')}`, 'layout');
  return result;
}

// ------------------------------------------------------------------ impugnaciones
export async function openDisputeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = await rpc('open_dispute', {
    p_market: String(formData.get('market_id')),
    p_reason: String(formData.get('reason') ?? '').trim(),
  });
  if (result.ok) revalidatePath(`/grupos/${formData.get('group_id')}`, 'layout');
  return result;
}

export async function castVoteAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const option = String(formData.get('option_id') ?? '');
  const result = await rpc('cast_dispute_vote', {
    p_market: String(formData.get('market_id')),
    p_option: option === 'void' ? null : option,
  });
  if (result.ok) revalidatePath(`/grupos/${formData.get('group_id')}`, 'layout');
  return result;
}

// ------------------------------------------------------------------ perfil
export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No has iniciado sesión.' };

  const symbol = String(formData.get('avatar_symbol') ?? '');
  const color = String(formData.get('avatar_color') ?? '');
  if (!AVATAR_SYMBOLS.includes(symbol as never) || !AVATAR_COLORS.includes(color as never)) {
    return { error: 'Ese avatar no es válido.' };
  }

  const instagram = limpiarInstagram(String(formData.get('instagram') ?? ''));
  if (instagram === false) {
    return { error: 'Ese usuario de Instagram no vale. Solo letras, números, punto y guion bajo.' };
  }

  const base = {
    display_name: String(formData.get('display_name') ?? '').trim(),
    avatar_symbol: symbol,
    avatar_color: color,
  };

  let { error } = await supabase
    .from('profiles')
    .update({ ...base, instagram })
    .eq('id', user.id);

  /* La columna `instagram` llega con la migración 0005. Si la base todavía no
     la tiene, se guarda el resto y se dice qué falta, en vez de tirar el
     cambio entero por una columna que el usuario ni ha tocado. PostgREST
     responde PGRST204 "Could not find the 'instagram' column". */
  if (error && (error.code === 'PGRST204' || /instagram/i.test(error.message))) {
    const reintento = await supabase.from('profiles').update(base).eq('id', user.id);
    if (reintento.error) return { error: mensajeDeError(reintento.error) };
    revalidatePath('/', 'layout');
    return {
      error:
        'Guardado todo menos Instagram: falta pasar la migración 0005 en el SQL Editor de Supabase.',
    };
  }

  if (error) return { error: mensajeDeError(error) };
  revalidatePath('/', 'layout');
  return { ok: true };
}


/**
 * Salirse de un grupo.
 *
 * La base ya lo permitía (hay política de borrado sobre la propia fila de
 * `group_members`) pero no había forma de hacerlo desde la app, así que la
 * única salida era pedirle a alguien que te borrara a mano.
 *
 * Quien montó el grupo no puede irse: dejaría el grupo sin nadie que resuelva
 * las apuestas y sin quien reparta el código. Los puntos y las apuestas ya
 * jugadas se quedan donde están; lo único que desaparece es el acceso.
 */
export async function leaveGroupAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: SIN_PROYECTO };
  const groupId = String(formData.get('group_id') ?? '');
  if (!groupId) return { error: 'Falta el grupo.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Tienes que entrar otra vez.' };

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return { error: 'Ya no estás en ese grupo.' };
  if (membership.role === 'owner') {
    return { error: 'Montaste tú el grupo: no puedes salirte y dejarlo sin dueño.' };
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) return { error: mensajeDeError(error) };
  revalidatePath('/grupos', 'layout');
  redirect('/grupos');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function markNotificationsReadAction(groupId: string): Promise<ActionResult> {
  const result = await rpc('mark_notifications_read', { p_group: groupId });
  if (result.ok) revalidatePath(`/grupos/${groupId}`, 'layout');
  return result;
}

// -------------------------------------------------------------- foto de perfil

/**
 * Qué decir cuando la base todavía no tiene la columna de la foto.
 *
 * PostgREST contesta PGRST204 «Could not find the 'avatar_path' column». Es
 * el mismo caso que el de Instagram: mejor decir qué falta que soltar el
 * error de la base tal cual.
 */
function faltaLaColumnaDeFoto(error: { code?: string; message: string }): boolean {
  return error.code === 'PGRST204' || /avatar_path/i.test(error.message);
}

const SIN_MIGRACION_FOTO =
  'Falta pasar la migración 0007 en el SQL Editor de Supabase para poder guardar fotos.';

/**
 * Guardar la foto de perfil.
 *
 * Lo que llega ya viene recortado y reencodado por el navegador, pero eso no
 * se puede dar por bueno: una acción de servidor es una dirección más y
 * cualquiera puede escribirle. Así que aquí se vuelve a comprobar todo lo que
 * importa, y sin fiarse del `content-type`, que es texto que manda el cliente:
 *
 *   - que haya sesión, y la carpeta se arma con ese id y no con nada del
 *     formulario;
 *   - que pese lo que puede pesar un avatar y no esté vacío;
 *   - y que los primeros bytes sean de verdad los de un JPEG o un WebP.
 *
 * Con eso, lo único que puede llegar al almacén es una imagen, en la carpeta
 * de quien la sube. Las políticas del cubo lo vuelven a exigir por su cuenta.
 */
export async function setProfilePhotoAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No has iniciado sesión.' };

  const subido = formData.get('foto');
  if (!(subido instanceof File) || subido.size === 0) {
    return { error: 'No ha llegado ninguna foto.' };
  }
  if (subido.size > MAX_BYTES_SALIDA) {
    return { error: 'Esa foto pesa demasiado. Vuelve a elegirla y se encoge sola.' };
  }

  const bytes = new Uint8Array(await subido.arrayBuffer());
  const tipo = olfatear(bytes);
  if (!tipo) return { error: 'Ese fichero no es una imagen.' };

  const ruta = rutaDeAvatar(user.id, tipo);

  const { error: subida } = await supabase.storage.from(CUBO).upload(ruta, bytes, {
    contentType: tipo,
    cacheControl: '31536000',
    upsert: false,
  });
  if (subida) {
    if (/bucket/i.test(subida.message) && /not found/i.test(subida.message)) {
      return { error: SIN_MIGRACION_FOTO };
    }
    return { error: mensajeDeError(subida) };
  }

  const { data: antes } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', user.id)
    .maybeSingle();

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_path: ruta })
    .eq('id', user.id);

  if (error) {
    /* Si no se puede apuntar, se deshace la subida: mejor no dejar bytes
       sueltos en el almacén que nadie va a mirar nunca. */
    await supabase.storage.from(CUBO).remove([ruta]);
    return { error: faltaLaColumnaDeFoto(error) ? SIN_MIGRACION_FOTO : mensajeDeError(error) };
  }

  const vieja = antes?.avatar_path as string | null | undefined;
  if (vieja && vieja !== ruta && esRutaDeAvatarDe(vieja, user.id)) {
    await supabase.storage.from(CUBO).remove([vieja]);
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Quitar la foto y volver al emblema. También borra el fichero. */
export async function removeProfilePhotoAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No has iniciado sesión.' };

  const { data: antes } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', user.id)
    .maybeSingle();

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_path: null })
    .eq('id', user.id);
  if (error) {
    return { error: faltaLaColumnaDeFoto(error) ? SIN_MIGRACION_FOTO : mensajeDeError(error) };
  }

  const vieja = antes?.avatar_path as string | null | undefined;
  if (esRutaDeAvatarDe(vieja, user.id)) {
    await supabase.storage.from(CUBO).remove([vieja as string]);
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
