import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let adminApp: admin.app.App | null = null;

export function getAdminApp() {
  if (!adminApp) {
    if (admin.apps.length > 0) {
      adminApp = admin.apps[0]!;
    } else {
      adminApp = admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  }
  return adminApp;
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export function getAdminFirestore() {
  // Use the same database ID as client
  return getFirestore(getAdminApp(), (firebaseConfig as any).firestoreDatabaseId);
}
