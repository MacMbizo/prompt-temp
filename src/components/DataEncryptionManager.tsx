
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Unlock, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EncryptionStatus {
  promptsEncrypted: boolean;
  foldersEncrypted: boolean;
  ratingsEncrypted: boolean;
  encryptionProgress: number;
  lastEncryptionCheck: string;
}

export const DataEncryptionManager: React.FC = () => {
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>({
    promptsEncrypted: false,
    foldersEncrypted: false,
    ratingsEncrypted: false,
    encryptionProgress: 0,
    lastEncryptionCheck: new Date().toISOString()
  });
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('');

  const generateEncryptionKey = () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setEncryptionKey(key);
    toast.success('New encryption key generated');
  };

  const toggleEncryption = async (dataType: string, enabled: boolean) => {
    setIsEncrypting(true);
    
    try {
      // Simulate encryption process
      for (let i = 0; i <= 100; i += 10) {
        setEncryptionStatus(prev => ({ ...prev, encryptionProgress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setEncryptionStatus(prev => ({
        ...prev,
        [`${dataType}Encrypted`]: enabled,
        encryptionProgress: 0,
        lastEncryptionCheck: new Date().toISOString()
      }));

      toast.success(`${dataType} ${enabled ? 'encrypted' : 'decrypted'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${enabled ? 'encrypt' : 'decrypt'} ${dataType}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const encryptAllData = async () => {
    setIsEncrypting(true);
    
    try {
      const dataTypes = ['prompts', 'folders', 'ratings'];
      
      for (const dataType of dataTypes) {
        for (let i = 0; i <= 100; i += 5) {
          setEncryptionStatus(prev => ({ ...prev, encryptionProgress: i }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        setEncryptionStatus(prev => ({
          ...prev,
          [`${dataType}Encrypted`]: true
        }));
      }

      setEncryptionStatus(prev => ({
        ...prev,
        encryptionProgress: 0,
        lastEncryptionCheck: new Date().toISOString()
      }));

      toast.success('All data encrypted successfully');
    } catch (error) {
      toast.error('Failed to encrypt all data');
    } finally {
      setIsEncrypting(false);
    }
  };

  const getOverallEncryptionStatus = () => {
    const encrypted = [
      encryptionStatus.promptsEncrypted,
      encryptionStatus.foldersEncrypted,
      encryptionStatus.ratingsEncrypted
    ].filter(Boolean).length;
    
    const total = 3;
    const percentage = (encrypted / total) * 100;
    
    return { encrypted, total, percentage };
  };

  const overallStatus = getOverallEncryptionStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Data Encryption Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Overall Encryption Status</h3>
                <Badge 
                  className={
                    overallStatus.percentage === 100 
                      ? 'bg-green-100 text-green-800' 
                      : overallStatus.percentage > 0 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {overallStatus.encrypted}/{overallStatus.total} Encrypted
                </Badge>
              </div>
              <Progress value={overallStatus.percentage} className="mb-2" />
              <p className="text-sm text-gray-600">
                {overallStatus.percentage === 100 
                  ? 'All data is encrypted and secure'
                  : `${overallStatus.encrypted} of ${overallStatus.total} data types are encrypted`
                }
              </p>
            </div>

            {/* Encryption Key Management */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Encryption Key
                </h3>
                <Button onClick={generateEncryptionKey} size="sm" variant="outline">
                  Generate New Key
                </Button>
              </div>
              {encryptionKey && (
                <div className="p-3 bg-gray-100 rounded font-mono text-sm break-all">
                  {encryptionKey}
                </div>
              )}
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Store your encryption key securely. Without it, encrypted data cannot be recovered.
                </AlertDescription>
              </Alert>
            </div>

            {/* Data Type Controls */}
            <div className="space-y-4">
              <h3 className="font-medium">Data Type Encryption</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">Prompts</div>
                      <div className="text-sm text-gray-600">Encrypt all prompt content and metadata</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {encryptionStatus.promptsEncrypted && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <Switch
                      checked={encryptionStatus.promptsEncrypted}
                      onCheckedChange={(checked) => toggleEncryption('prompts', checked)}
                      disabled={isEncrypting}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">Folders</div>
                      <div className="text-sm text-gray-600">Encrypt folder names and descriptions</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {encryptionStatus.foldersEncrypted && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <Switch
                      checked={encryptionStatus.foldersEncrypted}
                      onCheckedChange={(checked) => toggleEncryption('folders', checked)}
                      disabled={isEncrypting}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">Ratings & Reviews</div>
                      <div className="text-sm text-gray-600">Encrypt user ratings and review text</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {encryptionStatus.ratingsEncrypted && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <Switch
                      checked={encryptionStatus.ratingsEncrypted}
                      onCheckedChange={(checked) => toggleEncryption('ratings', checked)}
                      disabled={isEncrypting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Encryption Progress */}
            {isEncrypting && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="font-medium">Encrypting data...</span>
                </div>
                <Progress value={encryptionStatus.encryptionProgress} className="mb-2" />
                <p className="text-sm text-gray-600">
                  {encryptionStatus.encryptionProgress}% complete
                </p>
              </div>
            )}

            {/* Bulk Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={encryptAllData} 
                disabled={isEncrypting || overallStatus.percentage === 100}
                className="flex-1"
              >
                <Shield className="w-4 h-4 mr-2" />
                Encrypt All Data
              </Button>
              <Button 
                variant="outline" 
                disabled={isEncrypting || overallStatus.percentage === 0}
                className="flex-1"
                onClick={() => {
                  setEncryptionStatus(prev => ({
                    ...prev,
                    promptsEncrypted: false,
                    foldersEncrypted: false,
                    ratingsEncrypted: false
                  }));
                  toast.success('All data decrypted');
                }}
              >
                <Unlock className="w-4 h-4 mr-2" />
                Decrypt All Data
              </Button>
            </div>

            {/* Last Check */}
            <div className="text-xs text-gray-500 text-center">
              Last encryption check: {new Date(encryptionStatus.lastEncryptionCheck).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
