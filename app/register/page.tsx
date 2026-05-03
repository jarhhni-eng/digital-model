'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth-context'
import type { UserRole } from '@/lib/auth-types'
import { Brain, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [role, setRole] = useState<UserRole>('student')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttemptedSubmit(true)
    if (!consentAccepted) return
    setError('')
    setLoading(true)

    // useAuth().register() goes straight to Supabase Auth — the cookie
    // is set by the SDK and the public.profiles row is created by the
    // handle_new_user() trigger. No JSON file is touched.
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
    const result = await register(email.trim(), password, role, fullName)
    setLoading(false)

    if (!result.ok) {
      setError(result.error ?? 'Échec de l\'inscription')
      return
    }

    // If Supabase requires email confirmation, show a message instead of
    // redirecting (the user has no active session yet).
    if (result.emailConfirmationRequired) {
      setError('') // clear any previous error
      // Redirect to login with a confirmation hint so the user knows to check their email.
      router.push('/?info=check_email')
      return
    }

    if (role === 'admin') router.push('/admin')
    else if (role === 'teacher') router.push('/teacher/dashboard')
    else router.push('/profile-setup')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Plateforme de recherche — ENS Fès</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
              {(['student', 'teacher', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-md py-2 text-xs font-medium capitalize transition-colors ${
                    role === r ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {r === 'student' ? 'Élève' : r === 'teacher' ? 'Professeur' : 'Admin'}
                </button>
              ))}
            </div>

            {/* First & Last name */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Nom de famille"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Gmail */}
            <div className="space-y-2">
              <Label htmlFor="email">Gmail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@gmail.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Privacy consent */}
            <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm">Confidentialité et gestion des données</h3>
              </div>
              <ScrollArea className="h-32 pr-2">
                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Anonymisation :</strong>{' '}
                    Toutes les données collectées sont strictement anonymisées et utilisées à des fins
                    de recherche académique uniquement. Aucune donnée personnellement identifiable ne
                    sera publiée ou partagée sous une forme permettant l&apos;identification.
                  </p>
                  <p>
                    <strong className="text-foreground">Partage avec des tiers :</strong>{' '}
                    Les données ne sont pas partagées avec des tiers commerciaux. Elles pourront être
                    utilisées dans des publications scientifiques sous forme agrégée et anonyme, dans
                    le cadre d&apos;une recherche doctorale visant à mieux comprendre l&apos;apprentissage
                    de la géométrie au cycle secondaire qualifiant au Maroc.
                  </p>
                  <p>
                    <strong className="text-foreground">Sécurité :</strong>{' '}
                    Les données sont stockées sur des serveurs sécurisés conformes aux principes du
                    RGPD (Union Européenne). Vous pouvez demander la suppression ou la consultation
                    de vos données à tout moment en contactant l&apos;équipe de recherche — ENS Fès,
                    Université Sidi Mohamed Ben Abdellah.
                  </p>
                </div>
              </ScrollArea>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="consent"
                  checked={consentAccepted}
                  onCheckedChange={(v) => setConsentAccepted(!!v)}
                  className="mt-0.5"
                />
                <Label htmlFor="consent" className="text-xs leading-relaxed cursor-pointer font-normal">
                  J&apos;ai lu et j&apos;accepte les conditions de confidentialité et de traitement
                  des données à caractère personnel dans le cadre de cette recherche.
                </Label>
              </div>
              {attemptedSubmit && !consentAccepted && (
                <p className="text-xs text-destructive">
                  Vous devez accepter les conditions de confidentialité pour continuer.
                </p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !consentAccepted}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte…
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Déjà un compte ?{' '}
              <Link href="/" className="text-primary underline">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
