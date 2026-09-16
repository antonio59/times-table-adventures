import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/trail/Mascot";
import { Compass } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-sm">
          <Mascot className="w-24 h-24 mx-auto mb-2" />
          <h1 className="font-display mb-2 text-4xl font-bold">
            Off the trail!
          </h1>
          <p className="mb-6 text-muted-foreground">
            This part of the map doesn&apos;t exist yet. Let&apos;s get you
            back on the path.
          </p>
          <Link to="/">
            <Button size="lg">
              <Compass className="w-5 h-5" />
              Back to the Trail
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
