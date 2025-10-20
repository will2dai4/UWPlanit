import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Information</h3>
              <p className="text-muted-foreground">
                When you create an account, we collect your email address for authentication purposes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Data</h3>
              <p className="text-muted-foreground">
                We collect anonymized usage data to improve our service, including page views, feature usage, and error
                reports.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Course Plans</h3>
              <p className="text-muted-foreground">
                Your course plans, checklists, and planner data are stored securely in our database and are only accessible
                to you.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our service</li>
              <li>To authenticate your account and secure your data</li>
              <li>To analyze usage patterns and improve our features</li>
              <li>To respond to your requests and provide customer support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data. All data is encrypted in transit using
              HTTPS, and sensitive information is encrypted at rest. Access to your data is restricted to authorized
              personnel only.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your course plans and checklists</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or your data, please contact us through our GitHub repository
              or email.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

