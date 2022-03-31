// second.js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function SecondPage({ data }) {
  return (
    <div>
      <Head>
        <title>Second page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Second page</h1>
        <p>
          This is the second page. Go to{" "}
          <Link href="/">
            <a>Home</a>
          </Link>
        </p>

        <div>
          {data.map(user => (
            <div key={user.id}>
              <h2>{user.name} &rarr;</h2>
              <p>Works in {user.company.name}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await res.json();
  return {
    props: {
      data: data.slice(0, 4),
    },
  };
};
