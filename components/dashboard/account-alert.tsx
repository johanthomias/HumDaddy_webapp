'use client';

type AlertVariant = 'ban' | 'restricted';

const variantStyles: Record<AlertVariant, { bg: string; border: string; title: string; text: string }> = {
  ban: {
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    title: 'Compte suspendu',
    text: 'Votre compte a été suspendu par l’équipe.',
  },
  restricted: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-500/30',
    title: 'Compte temporairement limité',
    text: 'Certaines fonctionnalités sont désactivées tant que votre situation n’est pas régularisée.',
  },
};

export const AccountAlert = ({
  variant,
  banReason,
}: {
  variant: AlertVariant;
  banReason?: string | null;
}) => {
  const styles = variantStyles[variant];
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm text-white/80 ${styles.bg} ${styles.border} space-y-1`}
    >
      <p className="text-base font-semibold">{styles.title}</p>
      <p className="text-white/70">
        {styles.text}
        {variant === 'ban' && banReason ? ` Motif : ${banReason}` : null}
      </p>
    </div>
  );
};
