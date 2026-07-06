import { useAuthStore } from '@/lib/auth-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Mail, Calendar, Globe, Palette } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Card className="text-center">
        <CardContent className="pt-8">
          <Avatar
            src={user.avatar}
            alt={user.name}
            fallback={user.name.charAt(0).toUpperCase()}
            className="mx-auto h-24 w-24"
          />
          <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge variant="secondary">{user.theme} mode</Badge>
            <Badge variant="secondary">{user.timezone}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">{format(new Date(user.createdAt), 'MMMM yyyy')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Timezone</p>
              <p className="font-medium">{user.timezone}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
