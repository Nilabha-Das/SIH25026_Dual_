import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, IdCard, Calendar, Shield } from 'lucide-react';
import { User as UserType } from '@/lib/mockData';

interface PatientCardProps {
  patient: UserType;
  showConsent?: boolean;
}

export function PatientCard({ patient, showConsent = true }: PatientCardProps) {
  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{patient.name}</h3>
            <p className="text-muted-foreground">Patient Information</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* ABHA ID */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <IdCard className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">ABHA ID</p>
            <p className="text-lg font-mono text-primary">{patient.abhaId}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{patient.email}</p>
            </div>
          </div>
          
          {patient.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">{patient.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Registration Date */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Registered</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(patient.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Consent Status */}
        {showConsent && (
          <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium text-foreground">Data Sharing Consent</p>
                <p className="text-xs text-muted-foreground">ABHA compliant consent given</p>
              </div>
            </div>
            <Badge className="bg-success text-white">Active</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}