import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using UWPlanit, you accept and agree to be bound by the terms and provisions of this
              agreement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Permission is granted to use UWPlanit for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.</p>
            <p className="text-muted-foreground">You may not:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to reverse engineer any software contained on UWPlanit</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">When you create an account with us, you must:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Data Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              While we strive to provide accurate and up-to-date course information from the University of Waterloo Open
              Data API, we cannot guarantee the completeness or accuracy of all data. Always verify important information
              with official university sources before making academic decisions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              UWPlanit is provided "as is" without any warranties. We shall not be liable for any damages arising from the
              use or inability to use our service, including but not limited to academic planning errors, missed
              prerequisites, or incorrect course information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may revise these terms of service at any time without notice. By continuing to use UWPlanit after changes
              are made, you agree to be bound by the revised terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

